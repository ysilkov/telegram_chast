import { Telegraf } from 'telegraf';
import express from 'express';

const bot = new Telegraf(process.env.BOT_TOKEN);

// === логіка бота ===
bot.start((ctx) => ctx.reply('Бот запущено ✅'));
bot.on('text', (ctx) => ctx.reply(`Ти написав: ${ctx.message.text}`));

// === Створюємо Express сервер ===
const app = express();
app.use(express.json());

// Telegram надсилатиме запити сюди:
app.post(`/api/bot`, (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Експортуємо для Vercel
export default app;