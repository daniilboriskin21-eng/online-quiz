# Онлайн-квиз для друзей

Fullstack-приложение для проведения викторин в реальном времени. Ведущий создаёт комнату с готовым квизом, друзья подключаются со смартфонов или компьютеров по 6-значному коду, отвечают на вопросы с ограничением времени, а сервер ведёт подсчёт очков и объявляет победителей на пьедестале.

Интерфейс оформлен в эстетике **Modern Sleek / Dark Glass** (полупрозрачные стеклянные карточки, акцентные градиенты, анимация таймера и векторная графика Lucide).

Проект разработан на чистом JavaScript: **React 19 + Vite** на клиенте, **Node.js + Express + Socket.IO** на сервере, **PostgreSQL** в качестве базы данных.

---

## Архитектура и ключевые особенности

- **Авторитетный сервер (Server Authority):** сервер является единственным источником правды. Таймер раунда и дедлайн (`ends_at`) рассчитываются и валидируются сервером. Клиентские таймеры служат только для плавной анимации.
- **Защита от читерства (Data Hiding):** правильные ответы принципиально скрыты на сервере и не отправляются в сокет до официального закрытия раунда сервером.
- **Два типа вопросов:**
  - `choice` — классический вопрос с 4 вариантами ответов (A, B, C, D).
  - `text` — открытый вопрос, где игрок вводит ответ вручную в поле ввода.
- **Умная нормализация текста (Smart Text Matching):** сервер перед проверкой текстового ответа удаляет лишние пробелы, знаки препинания, переводит строку в нижний регистр и заменяет букву *«ё»* на *«е»*. Ответ засчитывается, если он совпадает с любым из вариантов массива `accepted_answers` (*«Тарантино»* = *«тарантино»* = *«Квентин Тарантино»*).
- **Идемпотентность и целостность:** повторные клики или ретраи при нестабильной сети подтверждают уже сохранённый ответ без дублирования очков. Ограничения `UNIQUE (round_id, member_id)` в PostgreSQL исключают гонки данных.
- **Отслеживание присутствия (Presence):** статус игроков (`в сети` / `не в сети`) динамически обновляется через Socket.IO в оперативной памяти сервера, не удаляя участников из базы данных при перезагрузке страницы.
- **Восстановление после сбоев (Crash Recovery):**
  - При перезагрузке вкладки (F5) участник восстанавливает сессию по cookie `quiz_session` и возвращается в активный раунд с сохранённым ответом и оставшимся временем.
  - При рестарте сервера Node.js активные раунды автоматически восстанавливаются или закрываются по истечении дедлайна.
- **Спортивное ранжирование (Competition Ranking 1224):** при равных очках игроки делят одно место (например, два первых места `1, 1`, а следующий игрок получает `3`).
- **Модульная компонентная архитектура:** фронтенд декомпозирован на независимые слои (`api`, `hooks`, `components`), а каждый экран собран из специализированных микро-компонентов.

---

## Структура проекта

```text
online-quiz/
├── client/                     # Клиентская часть (React 19 + Vite)
│   ├── src/
│   │   ├── api/                # Изолированный сетевой слой (fetch)
│   │   │   ├── quizzes.js      # Загрузка доступных викторин
│   │   │   ├── rooms.js        # Создание и вход в комнату
│   │   │   └── session.js      # Проверка и отзыв сессии
│   │   ├── hooks/
│   │   │   └── useQuizGame.js  # Главный хук: состояние игры, сокеты, действия
│   │   ├── components/         # Декларативные экраны и микро-компоненты
│   │   │   ├── common/         # Общие виджеты (Timer, LeaderboardTable, ConnectionError)
│   │   │   ├── home/           # Элементы главного экрана (HeroHeader, JoinRoomCard, QuizListCard)
│   │   │   ├── room/           # Верхняя панель (RoomHeader, RoomCodeBadge, UserRoleBadge)
│   │   │   ├── lobby/          # Элементы лобби (LobbyStatusBanner, PlayersGrid, LobbyActions)
│   │   │   ├── question/       # Экран вопроса (QuestionProgressBar, QuestionHeader, QuestionStatusBanner, ChoiceOptions, TextInputAnswer)
│   │   │   ├── results/        # Результаты и финал (ChoiceResults, TextResults, Podium, RoundActions)
│   │   │   ├── FinishedView.jsx
│   │   │   ├── HomeView.jsx
│   │   │   ├── LobbyView.jsx
│   │   │   ├── QuestionView.jsx
│   │   │   └── RoundResultsView.jsx
│   │   ├── App.jsx             # Верхнеуровневый роутер экранов по статусу комнаты
│   │   ├── App.css             # Стили компонентов и адаптивная сетка
│   │   └── index.css           # Базовая дизайн-система Dark Glass
│   └── package.json
│
├── server/                     # Серверная часть (Node.js + Express + Socket.IO)
│   ├── db/                     # Пул подключений к PostgreSQL
│   │   └── index.js
│   ├── routes/                 # REST API контроллеры
│   │   ├── quizzes.js
│   │   ├── rooms.js
│   │   └── session.js
│   ├── services/               # Бизнес-логика приложения
│   │   ├── game.service.js     # Старт раунда, прием ответов, нормализация, подсчет очков
│   │   ├── presence.service.js # Отслеживание сокетов онлайн/офлайн
│   │   ├── room.service.js     # Создание и получение комнат
│   │   ├── room-code.service.js# Генерация 6-значных уникальных кодов
│   │   ├── session.service.js  # Сессионные куки игроков
│   │   └── timer.service.js    # Серверные таймеры вопросов и автозавершение
│   ├── socket/                 # Обработчики событий Socket.IO
│   │   └── index.js
│   ├── scripts/                # Скрипты диагностики и миграций
│   │   ├── check-db.js         # Проверка подключения к PostgreSQL
│   │   ├── check-join.js       # Проверка подключения игрока
│   │   ├── check-room.js       # Проверка создания комнаты
│   │   ├── check-session.js    # Проверка работы куки-сессий
│   │   └── migrate.js          # Запуск SQL-миграций через пул Node.js
│   ├── sql/                    # Миграции базы данных (001–013)
│   ├── index.js                # Точка входа сервера Express
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## Окружение

- Node.js: `v20+` (проверено на `v24.17.0`)
- npm: `v10+` (проверено на `v11.13.0`)
- PostgreSQL: `v16+` (проверено на `17.4`)

---

## Быстрый старт

### 1. Настройка переменных окружения

В корне проекта скопируйте пример файла конфигурации:
```powershell
Copy-Item server/.env.example server/.env
```

Заполните параметры подключения к вашей базе данных PostgreSQL в файле `server/.env`:
```env
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=online_quiz
PGUSER=quiz_app
PGPASSWORD=ваш_пароль
```

### 2. Подготовка базы данных PostgreSQL

Создайте пользователя и базу данных под администратором PostgreSQL (`postgres`):
```sql
CREATE ROLE quiz_app WITH LOGIN PASSWORD 'ваш_пароль';
CREATE DATABASE online_quiz OWNER quiz_app;
```

#### Применение миграций

Вы можете применить миграции двумя способами:

**Способ А (через встроенный скрипт Node.js, не требует наличия `psql` в PATH):**
```powershell
cd server
node --env-file=.env scripts/migrate.js sql/001_create_quizzes.sql
node --env-file=.env scripts/migrate.js sql/002_seed_quizzes.sql
node --env-file=.env scripts/migrate.js sql/003_create_questions.sql
node --env-file=.env scripts/migrate.js sql/004_seed_questions.sql
node --env-file=.env scripts/migrate.js sql/005_create_options.sql
node --env-file=.env scripts/migrate.js sql/006_seed_options.sql
node --env-file=.env scripts/migrate.js sql/007_seed_options_second_question.sql
node --env-file=.env scripts/migrate.js sql/008_create_rooms.sql
node --env-file=.env scripts/migrate.js sql/009_add_room_status.sql
node --env-file=.env scripts/migrate.js sql/010_create_members.sql
node --env-file=.env scripts/migrate.js sql/011_create_rounds.sql
node --env-file=.env scripts/migrate.js sql/012_create_answers.sql
node --env-file=.env scripts/migrate.js sql/013_add_text_questions.sql
cd ..
```

**Способ Б (через консоль `psql`):**
```text
\i server/sql/001_create_quizzes.sql
\i server/sql/002_seed_quizzes.sql
\i server/sql/003_create_questions.sql
\i server/sql/004_seed_questions.sql
\i server/sql/005_create_options.sql
\i server/sql/006_seed_options.sql
\i server/sql/007_seed_options_second_question.sql
\i server/sql/008_create_rooms.sql
\i server/sql/009_add_room_status.sql
\i server/sql/010_create_members.sql
\i server/sql/011_create_rounds.sql
\i server/sql/012_create_answers.sql
\i server/sql/013_add_text_questions.sql
```

Проверить подключение к базе данных:
```powershell
node --env-file=server/.env server/scripts/check-db.js
```

### 3. Установка зависимостей

```powershell
cd client
npm install
cd ../server
npm install
cd ..
```

### 4. Запуск в режиме разработки

Откройте два окна терминала:

**Терминал 1 (Сервер):**
```powershell
cd server
npm run dev
```
*(Сервер запустится на `http://localhost:3000` в режиме `--watch`)*.

**Терминал 2 (Клиент):**
```powershell
cd client
npm run dev
```
*(Клиент откроется на `http://localhost:5173`)*.

---

## Игровой процесс

1. **Создание комнаты:** Ведущий выбирает викторину из списка и нажимает «Создать». Сервер генерирует уникальный 6-значный код комнаты и выдаёт ведущему сессионную cookie `quiz_session`.
2. **Вход игроков:** Игроки вводят код комнаты и свой никнейм. Код в шапке можно скопировать в буфер обмена в один клик. Состав лобби обновляется в реальном времени.
3. **Старт игры:** Ведущий нажимает «Начать игру» (кнопка активна при наличии хотя бы 1 подключённого игрока).
4. **Раунд вопроса:**
   - Если вопрос с выбором (`choice`) — игроки видят 4 карточки вариантов (A, B, C, D).
   - Если вопрос с открытым вводом (`text`) — отображается центрированное поле ввода с возможностью отправки по клавише `Enter`.
   - Синхронный таймер с пульсацией при $\le 5$ секундах отсчитывает время. Ответ фиксируется сервером, после чего поле/кнопки блокируются до конца раунда.
5. **Итоги раунда:** По истечении времени раунд автоматически закрывается. Подсвечивается правильный ответ (для `choice` — верная карточка, для `text` — эталонный ответ и плашка игрока: зелёная при успехе или красная при ошибке). Отображается таблица лидеров.
6. **Следующий вопрос / Финал:** Ведущий переключает раунды кнопкой «Следующий вопрос →». Когда все вопросы пройдены, ведущий нажимает «Показать итоги викторины 🏆».
7. **Пьедестал и выход:** Открывается 3D-подиум для 1-го 🥇, 2-го 🥈 и 3-го 🥉 мест, а также таблица остальных участников. Кнопка «В главное меню» корректно отзывает сессию в базе данных и очищает cookie.

---

## Контракт обмена данными

### HTTP REST API

| Метод & Маршрут | Описание | Доступ |
|---|---|---|
| `GET /api/health` | Проверка жизнеспособности сервера | Публичный |
| `GET /api/quizzes` | Список доступных квизов и число вопросов | Публичный |
| `POST /api/rooms` | Создание комнаты ведущим `{ quizId }` | Публичный |
| `POST /api/rooms/:code/join` | Вход игрока по коду комнаты и никнейму | Только в `lobby` |
| `GET /api/session` | Восстановление текущей сессии пользователя | По cookie |
| `GET /api/rooms/:code` | Получение информации о комнате | Участникам |
| `POST /api/session/leave` | Отзыв сессии и выход из игры | Участникам |

### Socket.IO события

- **Клиент → Сервер:**
  - `game:start` — запуск игры ведущим из лобби.
  - `answer:submit` — отправка ответа игроком:
    - `{ roundId, optionId }` — для вопросов с выбором;
    - `{ roundId, textAnswer }` — для вопросов с открытым вводом.
  - `game:continue` — переход к следующему вопросу или к финалу.
- **Сервер → Клиент:**
  - `room:state` — полное персональное состояние комнаты:
    - `room` (`code`, `status`, `quizTitle`, `questionCount`);
    - `hostOnline`, `players`;
    - `me` (`memberId`, `role`, `nickname`);
    - `round` (`id`, `number`, `question`: `{ text, type, options }`, `endsAt`);
    - `myAnswer` (`optionId`, `textAnswer`, `isCorrect` — отдаётся только после закрытия раунда);
    - `results` (`questionType`, `correctOptionId`, `correctText`, `leaderboard`).

---

## Проверки и команды разработки

Из папки `client`:
- `npm run lint` — проверка кода через ESLint.
- `npm run build` — production сборка Vite в папку `dist`.

Из папки `server`:
- `npm run dev` — запуск в режиме разработки с автоперезапуском при изменениях.
- `npm start` — production запуск сервера.
- `node --env-file=.env scripts/check-db.js` — проверка подключения к PostgreSQL.
- `node --env-file=.env scripts/check-session.js` — тест выдачи и валидации сессий.
