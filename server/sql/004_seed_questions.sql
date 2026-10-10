SET client_encoding = 'UTF-8';

INSERT INTO questions (quiz_id, text, position, duration_seconds)
VALUES 
    (
        (SELECT id FROM quizzes WHERE title = 'Кино'),
        'Кто режиссер фильма "Титаник" 1997 года?',
        1,
        30
    ),
    (
        (SELECT id FROM quizzes WHERE title = 'Кино'),
        'Как зовут главного героя серии фильмов "Индиана Джонс"?',
        2,
        30
    )
RETURNING id, quiz_id, position, text;