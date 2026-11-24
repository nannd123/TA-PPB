CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'book-open',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL,
  duration_seconds integer NOT NULL,
  is_daily boolean NOT NULL DEFAULT false,
  daily_date date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT quizzes_difficulty_valid CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT quizzes_duration_positive CHECK (duration_seconds > 0),
  CONSTRAINT quizzes_daily_date_matches_flag CHECK (is_daily = (daily_date IS NOT NULL))
);

CREATE UNIQUE INDEX quizzes_one_published_daily_per_date
  ON public.quizzes (daily_date)
  WHERE is_daily AND is_published;

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  explanation text NOT NULL DEFAULT '',
  points integer NOT NULL DEFAULT 1,
  order_number integer NOT NULL,
  CONSTRAINT questions_text_not_blank CHECK (length(trim(question_text)) > 0),
  CONSTRAINT questions_points_positive CHECK (points > 0),
  CONSTRAINT questions_order_positive CHECK (order_number > 0),
  CONSTRAINT questions_quiz_order_unique UNIQUE (quiz_id, order_number),
  CONSTRAINT questions_quiz_id_unique UNIQUE (quiz_id, id)
);

CREATE TABLE public.answer_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_label text NOT NULL,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  CONSTRAINT answer_options_label_valid CHECK (option_label IN ('A', 'B', 'C', 'D')),
  CONSTRAINT answer_options_text_not_blank CHECK (length(trim(option_text)) > 0),
  CONSTRAINT answer_options_question_label_unique UNIQUE (question_id, option_label),
  CONSTRAINT answer_options_question_id_unique UNIQUE (question_id, id)
);

CREATE FUNCTION public.assert_question_option_set(p_question_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  option_count bigint;
  correct_count bigint;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.questions
    WHERE id = p_question_id
  ) THEN
    RETURN;
  END IF;

  SELECT
    count(*),
    count(*) FILTER (WHERE is_correct)
  INTO option_count, correct_count
  FROM public.answer_options
  WHERE question_id = p_question_id;

  IF option_count <> 4 OR correct_count <> 1 THEN
    RAISE EXCEPTION
      'Question % must have exactly four options and exactly one correct option (found %, %)',
      p_question_id,
      option_count,
      correct_count
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE FUNCTION public.check_question_option_set()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_TABLE_NAME = 'questions' THEN
    IF TG_OP = 'DELETE' THEN
      PERFORM public.assert_question_option_set(OLD.id);
    ELSE
      PERFORM public.assert_question_option_set(NEW.id);
    END IF;
  ELSE
    IF TG_OP = 'DELETE'
      OR (TG_OP = 'UPDATE' AND NEW.question_id IS DISTINCT FROM OLD.question_id) THEN
      PERFORM public.assert_question_option_set(OLD.question_id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
      PERFORM public.assert_question_option_set(NEW.question_id);
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER questions_require_four_options
  AFTER INSERT OR UPDATE OR DELETE ON public.questions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_question_option_set();

CREATE CONSTRAINT TRIGGER answer_options_require_complete_set
  AFTER INSERT OR UPDATE OR DELETE ON public.answer_options
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_question_option_set();

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  submitted_at timestamptz,
  score numeric(5, 2),
  correct_count integer,
  total_questions integer,
  duration_seconds integer,
  CONSTRAINT quiz_attempts_status_valid
    CHECK (status IN ('in_progress', 'submitted', 'expired')),
  CONSTRAINT quiz_attempts_submission_time_matches_status
    CHECK ((status = 'submitted') = (submitted_at IS NOT NULL)),
  CONSTRAINT quiz_attempts_submitted_metrics_required
    CHECK (
      status <> 'submitted'
      OR (
        score IS NOT NULL
        AND correct_count IS NOT NULL
        AND total_questions IS NOT NULL
        AND duration_seconds IS NOT NULL
      )
    ),
  CONSTRAINT quiz_attempts_score_range
    CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  CONSTRAINT quiz_attempts_question_counts_valid
    CHECK (
      (total_questions IS NULL OR total_questions > 0)
      AND (
        correct_count IS NULL
        OR (
          correct_count >= 0
          AND total_questions IS NOT NULL
          AND correct_count <= total_questions
        )
      )
    ),
  CONSTRAINT quiz_attempts_duration_nonnegative
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  CONSTRAINT quiz_attempts_id_quiz_unique UNIQUE (id, quiz_id)
);

CREATE UNIQUE INDEX quiz_attempts_one_active_per_guest_quiz
  ON public.quiz_attempts (guest_id, quiz_id)
  WHERE status = 'in_progress';

CREATE INDEX quiz_attempts_guest_history
  ON public.quiz_attempts (guest_id, submitted_at DESC)
  WHERE status = 'submitted';

CREATE FUNCTION public.prevent_attempt_reuse()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status <> 'in_progress' THEN
    RAISE EXCEPTION 'A completed or expired attempt cannot be changed'
      USING ERRCODE = '55000';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.guest_id IS DISTINCT FROM OLD.guest_id
    OR NEW.quiz_id IS DISTINCT FROM OLD.quiz_id
    OR NEW.started_at IS DISTINCT FROM OLD.started_at THEN
    RAISE EXCEPTION 'Attempt identity fields cannot be changed'
      USING ERRCODE = '55000';
  END IF;

  IF NEW.status NOT IN ('submitted', 'expired') THEN
    RAISE EXCEPTION 'An attempt can only transition to submitted or expired'
      USING ERRCODE = '55000';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER quiz_attempts_allow_single_completion
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_attempt_reuse();

CREATE TABLE public.quiz_attempt_answers (
  attempt_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_option_id uuid,
  is_correct boolean NOT NULL DEFAULT false,
  CONSTRAINT quiz_attempt_answers_primary_key PRIMARY KEY (attempt_id, question_id),
  CONSTRAINT quiz_attempt_answers_attempt_quiz_fk
    FOREIGN KEY (attempt_id, quiz_id)
    REFERENCES public.quiz_attempts(id, quiz_id)
    ON DELETE CASCADE,
  CONSTRAINT quiz_attempt_answers_quiz_question_fk
    FOREIGN KEY (quiz_id, question_id)
    REFERENCES public.questions(quiz_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT quiz_attempt_answers_option_question_fk
    FOREIGN KEY (question_id, selected_option_id)
    REFERENCES public.answer_options(question_id, id)
    ON DELETE RESTRICT
);

CREATE FUNCTION public.submit_quiz_attempt(
  p_attempt_id uuid,
  p_guest_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_attempt public.quiz_attempts%ROWTYPE;
  quiz_duration integer;
  elapsed_seconds integer;
  question_count integer;
  correct_total integer;
  possible_points bigint;
  earned_points bigint;
  final_score numeric(5, 2);
BEGIN
  IF p_attempt_id IS NULL OR p_guest_id IS NULL THEN
    RAISE EXCEPTION 'Attempt and guest identifiers are required'
      USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(p_answers) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Answers must be a JSON array'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO current_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id
    AND guest_id = p_guest_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF current_attempt.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Attempt has already been submitted or expired'
      USING ERRCODE = '55000';
  END IF;

  SELECT duration_seconds
  INTO quiz_duration
  FROM public.quizzes
  WHERE id = current_attempt.quiz_id;

  elapsed_seconds := greatest(
    0,
    floor(extract(epoch FROM (clock_timestamp() - current_attempt.started_at)))::integer
  );

  IF elapsed_seconds > quiz_duration THEN
    UPDATE public.quiz_attempts
    SET status = 'expired',
        duration_seconds = elapsed_seconds
    WHERE id = current_attempt.id;

    RETURN jsonb_build_object(
      'expired', true,
      'attempt_id', current_attempt.id,
      'duration_seconds', elapsed_seconds
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_answers) AS answer(question_id uuid, selected_option_id uuid)
    GROUP BY question_id
    HAVING question_id IS NULL OR count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Answers contain a missing or duplicate question identifier'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_answers) AS answer(question_id uuid, selected_option_id uuid)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.questions AS question
      WHERE question.id = answer.question_id
        AND question.quiz_id = current_attempt.quiz_id
    )
  ) THEN
    RAISE EXCEPTION 'An answer references a question outside this quiz'
      USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_answers) AS answer(question_id uuid, selected_option_id uuid)
    WHERE answer.selected_option_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.answer_options AS answer_option
        WHERE answer_option.id = answer.selected_option_id
          AND answer_option.question_id = answer.question_id
      )
  ) THEN
    RAISE EXCEPTION 'An answer references an option outside its question'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*)::integer
  INTO question_count
  FROM public.questions
  WHERE quiz_id = current_attempt.quiz_id;

  IF question_count = 0 THEN
    RAISE EXCEPTION 'Quiz has no questions'
      USING ERRCODE = '55000';
  END IF;

  INSERT INTO public.quiz_attempt_answers (
    attempt_id,
    quiz_id,
    question_id,
    selected_option_id,
    is_correct
  )
  SELECT
    current_attempt.id,
    current_attempt.quiz_id,
    question.id,
    submitted_answer.selected_option_id,
    coalesce(answer_option.is_correct, false)
  FROM public.questions AS question
  LEFT JOIN LATERAL (
    SELECT answer.selected_option_id
    FROM jsonb_to_recordset(p_answers) AS answer(question_id uuid, selected_option_id uuid)
    WHERE answer.question_id = question.id
  ) AS submitted_answer ON true
  LEFT JOIN public.answer_options AS answer_option
    ON answer_option.id = submitted_answer.selected_option_id
   AND answer_option.question_id = question.id
  WHERE question.quiz_id = current_attempt.quiz_id;

  SELECT
    count(*) FILTER (WHERE attempt_answer.is_correct)::integer,
    coalesce(sum(question.points), 0),
    coalesce(sum(question.points) FILTER (WHERE attempt_answer.is_correct), 0)
  INTO correct_total, possible_points, earned_points
  FROM public.quiz_attempt_answers AS attempt_answer
  JOIN public.questions AS question
    ON question.id = attempt_answer.question_id
  WHERE attempt_answer.attempt_id = current_attempt.id;

  IF possible_points <= 0 THEN
    RAISE EXCEPTION 'Quiz must have questions with positive point values'
      USING ERRCODE = '55000';
  END IF;

  final_score := round(earned_points * 100.0 / possible_points, 2);

  UPDATE public.quiz_attempts
  SET status = 'submitted',
      submitted_at = clock_timestamp(),
      score = final_score,
      correct_count = correct_total,
      total_questions = question_count,
      duration_seconds = elapsed_seconds
  WHERE id = current_attempt.id;

  RETURN jsonb_build_object(
    'expired', false,
    'attempt_id', current_attempt.id,
    'score', final_score,
    'correct_count', correct_total,
    'total_questions', question_count,
    'duration_seconds', elapsed_seconds
  );
END;
$$;

REVOKE ALL ON FUNCTION public.assert_question_option_set(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_question_option_set() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_attempt_reuse() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, uuid, jsonb) TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.categories,
  public.quizzes,
  public.questions,
  public.answer_options,
  public.quiz_attempts,
  public.quiz_attempt_answers
FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.categories,
  public.quizzes,
  public.questions,
  public.answer_options,
  public.quiz_attempts,
  public.quiz_attempt_answers
TO service_role;
