SET client_encoding = 'UTF-8';

-- 1. Добавляем тип вопроса и массив допустимых ответов
ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS type varchar(20) NOT NULL DEFAULT 'choice' CHECK (type IN ('choice', 'text')),
    ADD COLUMN IF NOT EXISTS accepted_answers text[];

-- 2. В таблице ответов делаем option_id необязательным и добавляем text_answer
ALTER TABLE answers
    ALTER COLUMN option_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS text_answer text;

-- 3. Проверка целостности: либо option_id (для choice), либо text_answer (для text)
ALTER TABLE answers
    DROP CONSTRAINT IF EXISTS answers_choice_or_text_check;

ALTER TABLE answers
    ADD CONSTRAINT answers_choice_or_text_check CHECK (
        (option_id IS NOT NULL AND text_answer IS NULL) OR
        (option_id IS NULL AND text_answer IS NOT NULL)
    );

-- 4. Добавляем 3-й вопрос в квиз "Кино" с типом 'text'
INSERT INTO questions (quiz_id, text, position, duration_seconds, type, accepted_answers)
VALUES (
    (SELECT id FROM quizzes WHERE title = 'Кино'),
    'Фамилия режиссера фильма "Криминальное чтиво"?',
    3,
    30,
    'text',
    ARRAY['Тарантино', 'Квентин Тарантино', 'Tarantino', 'Quentin Tarantino']
)
ON CONFLICT (quiz_id, position) DO NOTHING;