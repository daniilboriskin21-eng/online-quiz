ALTER TABLE rooms
ADD COLUMN status text NOT NULL DEFAULT 'lobby'
CHECK (status IN ('lobby', 'question', 'round_results', 'finished'));