import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const dailyCron = process.env.DAILY_CRON || '0 9 * * *'; // 09:00 daily, server time
const webhookDomain = process.env.WEBHOOK_DOMAIN; // e.g. https://your-app.fly.dev
const webhookPath = process.env.WEBHOOK_PATH || '/tg-bot';
const port = Number(process.env.PORT) || 3000;

if (!token) {
  console.error('Missing TELEGRAM_TOKEN. Set it in your environment or .env file.');
  process.exit(1);
}

const affirmations = [
  'У меня есть всё необходимое для успеха.',
  'Я спокоен, силён и устойчив.',
  'Я доверяю себе и принимаю верные решения.',
  'Я заслуживаю хорошего и новых возможностей.',
  'Я учусь и расту в каждом опыте.',
  'Я выбираю прогресс, а не перфекционизм.',
  'Я способен, креативен и уверен.',
  'Я справляюсь с задачами спокойно и ясно.',
  'Я благодарен за победы — большие и маленькие.',
  'Я приношу пользу людям вокруг меня.',
];

const subscribers = new Set();

const bot = new Telegraf(token);

const randomAffirmation = () => affirmations[Math.floor(Math.random() * affirmations.length)];

const todayAffirmation = () => {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % affirmations.length;
  return affirmations[dayIndex];
};

const cronToHuman = (expr) => {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 2) return expr;
  const [minute, hour] = parts;
  const m = Number(minute);
  const h = Number(hour);
  if (!Number.isInteger(m) || !Number.isInteger(h) || m < 0 || m > 59 || h < 0 || h > 23) return expr;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)} (время сервера)`;
};

const sendAffirmation = async (chatId, text) => {
  try {
    await bot.telegram.sendMessage(chatId, text);
  } catch (err) {
    console.error(`Failed to send to ${chatId}:`, err.message);
  }
};

bot.start(async (ctx) => {
  subscribers.add(ctx.chat.id);
  const humanSchedule = cronToHuman(dailyCron);
  const lines = [
    'Привет! Я буду присылать тебе ежедневные аффирмации.',
    'Команды: /affirm — случайная, /today — сегодняшняя.',
    'Ты подписан на ежедневные сообщения. /stop отменит подписку.',
    `Расписание: ${humanSchedule}.`,
  ];
  await ctx.reply(lines.join('\n'));
});

bot.command('affirm', (ctx) => ctx.reply(randomAffirmation()));

bot.command('today', (ctx) => ctx.reply(todayAffirmation()));

bot.command('subscribe', (ctx) => {
  subscribers.add(ctx.chat.id);
  return ctx.reply('Подписка сохранена. Ежедневные аффирмации будут приходить.');
});

bot.command('stop', (ctx) => {
  subscribers.delete(ctx.chat.id);
  return ctx.reply('Подписка отключена. Возвращайся в любое время.');
});

cron.schedule(dailyCron, () => {
  const message = `Ежедневная аффирмация: ${todayAffirmation()}`;
  console.log(`Отправляю ежедневную аффирмацию в ${subscribers.size} чат(ов).`);
  subscribers.forEach((chatId) => {
    sendAffirmation(chatId, message);
  });
});

const launch = async () => {
  if (webhookDomain) {
    await bot.launch({
      webhook: {
        domain: webhookDomain,
        hookPath: webhookPath,
        port,
      },
    });
    console.log(`Bot is running via webhook at ${webhookDomain}${webhookPath} on port ${port}.`);
  } else {
    await bot.launch();
    console.log('Bot is running in polling mode (set WEBHOOK_DOMAIN to switch to webhooks).');
  }
};

launch()
  .catch((err) => {
    console.error('Failed to launch bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
