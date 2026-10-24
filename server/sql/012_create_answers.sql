CREATE TABLE
    answers (
        id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        round_id integer NOT NULL REFERENCES rounds (id),
        member_id integer NOT NULL REFERENCES members (id),
        option_id integer NOT NULL REFERENCES options (id),
        accepted_at timestamptz NOT NULL DEFAULT now (),
        points integer NOT NULL CHECK (points IN (0, 1)),
        UNIQUE (round_id, member_id)
    );