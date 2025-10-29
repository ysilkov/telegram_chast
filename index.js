import express from "express";
import { Telegraf, Markup } from "telegraf";
import "dotenv/config";

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

const userData = new Map();

// Таблиця відсотків за строками (умовно)
const rates = {
  3: 0.031,  
  4: 0.047,
  5: 0.062,
  6: 0.079,
  7: 0.091,
  8: 0.105,
  9: 0.117,
  10: 0.13,
  11: 0.136,
  12: 0.143,
  13: 0.149,
  14: 0.159,
  15: 0.17,
  16: 0.181,
  17: 0.193,
  18: 0.205,
  19: 0.212,
  20: 0.22,
  21: 0.223,
  22: 0.227,
  23: 0.231,
  24: 0.235
};

// === Логіка бота ===
bot.start((ctx) => {
  ctx.reply('Привіт 👋 Вкажи суму кредиту, яку хочеш розрахувати:');
  userData.delete(ctx.chat.id);
});

bot.on("text", (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();

  if (!userData.has(chatId)) {
    const amount = parseFloat(text);

    if (isNaN(amount) || amount <= 0) {
      return ctx.reply("Введи правильну суму (наприклад, 10000).");
    }

    userData.set(chatId, { amount });

    const keys = Object.keys(rates);
    const buttons = [];

    for (let i = 0; i < keys.length; i += 3) {
      buttons.push(
        keys.slice(i, i + 3).map((months) =>
          Markup.button.callback(`${months}`, `term_${months}`)
        )
      );
    }

    return ctx.reply("📆 Обери строк кредиту:", Markup.inlineKeyboard(buttons));
  }

  ctx.reply("Спочатку обери строк із кнопок нижче ⬇️");
});

bot.action(/term_(\d+)/, async (ctx) => {
  const months = parseInt(ctx.match[1]);
  const chatId = ctx.chat.id;
  const data = userData.get(chatId);

  if (!data) {
    return ctx.reply("Спочатку введи суму кредиту.");
  }

  const rate = rates[months];
  const finalSum = data.amount + data.amount * rate;

  await ctx.reply(
    `💰 Початкова сума: ${data.amount.toFixed(2)} грн\n` +
    `📆 Строк: ${months} міс.\n` +
    `📈 Ставка: ${(rate * 100).toFixed(2)}%\n` +
    `💵 Внести суму в програму потрібно: ${finalSum.toFixed(2)} грн`
  );

  userData.delete(chatId);

  setTimeout(() => {
    ctx.reply("🔁 Хочеш зробити новий розрахунок? Введи нову суму:");
  }, 500);
});

// === Webhook ===
const PORT = process.env.PORT || 10000;
const URL = "https://telegram-chast.onrender.com"; // заміни на свій Render URL

app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook(`${URL}/bot`);

app.get("/", (req, res) => res.send("Бот працює ✅"));

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
