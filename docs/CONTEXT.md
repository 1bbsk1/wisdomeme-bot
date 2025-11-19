# Wisdomeme Bot — Context

**Repo**: git@github.com:1bbsk1/wisdomeme-bot.git (main)
**Stack**: Node.js (Telegraf + node-cron), pm2 for process management, Caddy reverse proxy for webhook HTTPS.
**Bot**: @wisdomeme_bot — Russian interface/affirmations. Commands: /start, /affirm, /today, /subscribe, /stop. Cron shown in human HH:MM server time.

## Deployment
- **Server**: Timeweb, Ubuntu 22.04, public IP 147.45.245.228.
- **Domain**: wisdomeme.ffffagency.ru (A -> 147.45.245.228).
- **Ports**: 22 (SSH), 80/443 (HTTPS) open via firewall.
- **Caddy**: /etc/caddy/Caddyfile
  ```
  wisdomeme.ffffagency.ru {
      reverse_proxy 127.0.0.1:3000
  }
  ```
  Reload with `systemctl reload caddy`.
- **Env**: ~/wisdomeme-bot/.env (TELEGRAM_TOKEN, WEBHOOK_DOMAIN=https://wisdomeme.ffffagency.ru, WEBHOOK_PATH=/tg-bot, PORT=3000, DAILY_CRON optional).
- **Process (pm2)**: name `wisdomeme-bot`, started via `pm2 start npm --name wisdomeme-bot -- start`; `pm2 save`; `pm2 startup` (command executed once). Logs: `pm2 logs wisdomeme-bot --lines 50`. Status: `pm2 status`.
- **Webhook vs polling**: WEBHOOK_DOMAIN set -> webhook mode. If cleared -> polling.

## Code notes
- src/bot.js: Russian messages; cron humanized; in-memory subscribers (lost on restart); daily cron via node-cron.
- Commands settable in BotFather (recommended):
  ```
  start - Начать и подписаться
  affirm - Случайная аффирмация
  today - Аффирмация на сегодня
  subscribe - Включить ежедневные сообщения
  stop - Отключить ежедневные сообщения
  ```

## SSH / Git
- Server SSH key for GitHub: ~/.ssh/id_ed25519_github with config
  ```
  Host github.com
    IdentityFile ~/.ssh/id_ed25519_github
    IdentitiesOnly yes
  ```
- Clone path on server: ~/wisdomeme-bot

## Known gaps
- No persistence for subscriber list (restart drops it).
- No per-user schedule/timezone; daily cron is global server time.
- Group helpers: inline buttons not implemented; privacy mode not adjusted.
- Security: password SSH login not disabled yet.
