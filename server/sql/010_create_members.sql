CREATE TABLE members (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id integer NOT NULL REFERENCES rooms(id),
    role text NOT NULL CHECK (role IN ('host', 'player')),
    nickname text,
    session_token_hash text NOT NULL UNIQUE,
    session_expires_at timestamptz NOT NULL,
    session_revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (
        role <> 'player'
        OR (nickname IS NOT NULL AND length(trim(nickname)) > 0)
    )
);

CREATE UNIQUE INDEX members_one_host_per_room
ON members (room_id)
WHERE role = 'host';