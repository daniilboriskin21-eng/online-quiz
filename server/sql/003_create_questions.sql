CREATE TABLE
    questions (
        id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        quiz_id integer NOT NULL REFERENCES quizzes (id),
        text text NOT NULL CHECK (length (trim(text)) > 0),
        position integer NOT NULL CHECK (position > 0),
        duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
        UNIQUE (quiz_id, position)
    );