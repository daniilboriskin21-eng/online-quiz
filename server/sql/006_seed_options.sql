SET client_encoding = 'UTF-8';

INSERT INTO options (question_id, text, position, is_correct)
VALUES
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 1
        ),
        'Джеймс Кэмерон',
        1,
        true
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 1
        ),
        'Стивен Спилберг',
        2,
        false
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 1
        ),
        'Кристофер Нолан',
        3,
        false
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 1
        ),
        'Питер Джексон',
        4,
        false
    );