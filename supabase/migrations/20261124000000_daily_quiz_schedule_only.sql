BEGIN;

LOCK TABLE public.quizzes, public.daily_quiz_schedule IN ACCESS EXCLUSIVE MODE;

INSERT INTO public.daily_quiz_schedule (scheduled_date, quiz_id)
SELECT quiz.daily_date, quiz.id
FROM public.quizzes AS quiz
WHERE quiz.is_daily
  AND quiz.daily_date IS NOT NULL
  AND public.is_daily_quiz_eligible(quiz.id)
ON CONFLICT (scheduled_date) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.quizzes AS quiz
    WHERE quiz.is_daily IS DISTINCT FROM (quiz.daily_date IS NOT NULL)
       OR (
         quiz.is_daily
         AND NOT EXISTS (
           SELECT 1
           FROM public.daily_quiz_schedule AS schedule
           WHERE schedule.scheduled_date = quiz.daily_date
             AND schedule.quiz_id = quiz.id
         )
       )
  ) THEN
    RAISE EXCEPTION
      'Cannot remove legacy Daily Quiz fields: at least one legacy assignment is invalid or not represented in daily_quiz_schedule';
  END IF;
END;
$$;

DROP INDEX IF EXISTS public.quizzes_one_published_daily_per_date;
ALTER TABLE public.quizzes
  DROP CONSTRAINT IF EXISTS quizzes_daily_date_matches_flag,
  DROP COLUMN is_daily,
  DROP COLUMN daily_date;

COMMIT;
