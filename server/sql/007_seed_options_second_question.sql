SET client_encoding = 'UTF-8';

INSERT INTO options (question_id, text, position, is_correct)
VALUES
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 2
        ),
        'Индиана Джонс',
        1,
        true
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 2
        ),
        'Джек Воробей',
        2,
        false
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 2
        ),
        'Джеймс Бонд',
        3,
        false
    ),
    (
        (
            SELECT id FROM questions
            WHERE quiz_id = (SELECT id FROM quizzes WHERE title = 'Кино')
                AND position = 2
        ),
        'Рик О’Коннелл',
        4,
        false
    );