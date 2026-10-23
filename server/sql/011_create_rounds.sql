CREATE TABLE rounds (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id integer NOT NULL REFERENCES rooms(id),
    question_id integer NOT NULL REFERENCES questions(id),
    started_at timestamptz NOT NULL DEFAULT now(),
    ends_at timestamptz NOT NULL,
    closed_at timestamptz,
    CHECK (ends_at > started_at),
    UNIQUE (room_id, question_id)
);