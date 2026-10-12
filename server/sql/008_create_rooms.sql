CREATE TABLE rooms (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code text NOT NULL UNIQUE CHECK (length(trim(code)) > 0),
    quiz_id integer NOT NULL REFERENCES quizzes(id),
    created_at timestamptz NOT NULL DEFAULT now()
);