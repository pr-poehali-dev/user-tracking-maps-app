INSERT INTO racers (phone, pwd, name, account_type, initials, created_at) VALUES
  ('+79000000001', 'admin123', 'Администратор', 'admin', 'АД', NOW()),
  ('+79000000002', 'racer123', 'Иван Петров', 'racer', 'ИП', NOW()),
  ('+79000000003', 'racer123', 'Мария Смирнова', 'racer', 'МС', NOW()),
  ('+79000000004', 'racer123', 'Алексей Козлов', 'racer', 'АК', NOW())
ON CONFLICT (phone) DO NOTHING;