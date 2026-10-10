CREATE TABLE
    quizzes (
        id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        title text NOT NULL CHECK (length (trim(title)) > 0)
    );