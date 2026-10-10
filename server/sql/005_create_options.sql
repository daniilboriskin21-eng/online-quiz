CREATE TABLE options (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id integer NOT NULL REFERENCES questions(id),
    text text NOT NULL CHECK (length(trim(text)) > 0),
    position integer NOT NULL CHECK (position BETWEEN 1 AND 4),
    is_correct boolean NOT NULL,
    UNIQUE (question_id, position)
);