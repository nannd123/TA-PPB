CREATE TABLE public.daily_quiz_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date date NOT NULL UNIQUE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX daily_quiz_schedule_quiz_date_idx
  ON public.daily_quiz_schedule (quiz_id, scheduled_date DESC);

ALTER TABLE public.daily_quiz_schedule ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.daily_quiz_schedule FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.daily_quiz_schedule TO service_role;

CREATE FUNCTION public.is_daily_quiz_eligible(p_quiz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quizzes AS quiz
    JOIN public.categories AS category
      ON category.id = quiz.category_id
    WHERE quiz.id = p_quiz_id
      AND quiz.is_published
      AND length(trim(quiz.title)) > 0
      AND length(trim(quiz.description)) > 0
      AND length(trim(category.name)) > 0
      AND (
        SELECT count(*)
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
      ) = 5
      AND (
        SELECT count(DISTINCT question.order_number)
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
      ) = 5
      AND (
        SELECT min(question.order_number)
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
      ) = 1
      AND (
        SELECT max(question.order_number)
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
      ) = 5
      AND (
        SELECT count(DISTINCT lower(trim(question.question_text)))
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
      ) = 5
      AND NOT EXISTS (
        SELECT 1
        FROM public.questions AS question
        WHERE question.quiz_id = quiz.id
          AND (
            length(trim(question.question_text)) = 0
            OR length(trim(question.explanation)) = 0
          )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.questions AS question
        LEFT JOIN public.answer_options AS answer_option
          ON answer_option.question_id = question.id
        WHERE question.quiz_id = quiz.id
        GROUP BY question.id
        HAVING count(answer_option.id) <> 4
          OR count(DISTINCT answer_option.option_label) <> 4
          OR count(*) FILTER (WHERE answer_option.is_correct) <> 1
          OR count(DISTINCT lower(trim(answer_option.option_text))) <> 4
          OR coalesce(bool_or(
            answer_option.id IS NOT NULL AND length(trim(answer_option.option_text)) = 0
          ), false)
      )
  );
$$;

CREATE FUNCTION public.ensure_daily_quiz_scheduled(
  p_scheduled_date date DEFAULT ((now() AT TIME ZONE 'Asia/Jakarta')::date)
)
RETURNS TABLE (
  id uuid,
  scheduled_date date,
  quiz_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  existing_schedule public.daily_quiz_schedule%ROWTYPE;
  selected_quiz_id uuid;
BEGIN
  IF p_scheduled_date IS NULL THEN
    RAISE EXCEPTION 'A schedule date is required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(7102026, 1);

  SELECT schedule.*
  INTO existing_schedule
  FROM public.daily_quiz_schedule AS schedule
  WHERE schedule.scheduled_date = p_scheduled_date;

  IF FOUND THEN
    IF public.is_daily_quiz_eligible(existing_schedule.quiz_id) THEN
      RETURN QUERY
      SELECT existing_schedule.id,
             existing_schedule.scheduled_date,
             existing_schedule.quiz_id,
             existing_schedule.created_at;
    END IF;
    RETURN;
  END IF;

  SELECT quiz.id
  INTO selected_quiz_id
  FROM public.quizzes AS quiz
  LEFT JOIN LATERAL (
    SELECT count(*) AS usage_count, max(schedule.scheduled_date) AS last_used
    FROM public.daily_quiz_schedule AS schedule
    WHERE schedule.quiz_id = quiz.id
  ) AS usage ON true
  WHERE public.is_daily_quiz_eligible(quiz.id)
  ORDER BY usage.usage_count ASC,
           usage.last_used ASC NULLS FIRST,
           quiz.created_at ASC,
           quiz.id ASC
  LIMIT 1;

  IF selected_quiz_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.daily_quiz_schedule (scheduled_date, quiz_id)
  VALUES (p_scheduled_date, selected_quiz_id)
  RETURNING daily_quiz_schedule.id,
            daily_quiz_schedule.scheduled_date,
            daily_quiz_schedule.quiz_id,
            daily_quiz_schedule.created_at
  INTO id, scheduled_date, quiz_id, created_at;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.is_daily_quiz_eligible(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_daily_quiz_scheduled(date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_daily_quiz_eligible(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_daily_quiz_scheduled(date) TO service_role;

INSERT INTO public.daily_quiz_schedule (scheduled_date, quiz_id)
SELECT quiz.daily_date, quiz.id
FROM public.quizzes AS quiz
WHERE quiz.is_daily
  AND quiz.daily_date IS NOT NULL
  AND public.is_daily_quiz_eligible(quiz.id)
ON CONFLICT (scheduled_date) DO NOTHING;
