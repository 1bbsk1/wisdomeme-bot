# Wisdomeme Bot — Next Steps

- **Commands UX**: /help + inline клавиатура в /start (кнопки Случайная/Сегодня/Отписаться). Указать в BotFather команды (уже рекомендованные).
- **Persistence**: сохранить подписчиков и настройки в файле/SQLite, чтобы переживать рестарт.
- **Персональное время**: команда типа /time 09:00 (UTC или локаль) с сохранением расписания, опционально timezone; fallback — общий DAILY_CRON.
- **Безопасность SSH**: отключить парольный вход (PasswordAuthentication no, PermitRootLogin prohibit-password), оставить ключ.
- **Мониторинг/логи**: pm2 logs, pm2 monit; добавить /ping или health endpoint.
- **Группы**: отключить privacy mode при необходимости реагировать на сообщения без слешей; пока работаем через команды.
- **Статика/сайт**: при необходимости добавить виртуал на Caddy/Nginx и задеплоить лендинг.
- **Хуки/обновления**: при изменениях деплой через git pull, npm install (если надо), pm2 restart wisdomeme-bot.
