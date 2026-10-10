SET client_encoding = 'UTF8';
INSERT INTO
    quizzes (title)
VALUES
    ('Кино') 
    RETURNING id,
    title;