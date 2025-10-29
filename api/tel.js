import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
const userData = new Map();

// Таблиця відсотків
const rates = { 3:0.031,4:0.047,5:0.062,6:0.079,7:0.091,8:0.105,9:0.117,10:0.13,11:0.136,12:0.143,13:0.149,14:0.159,15:0.17,16:0.181,17:0.193,18:0.205,19:0.212,20:0.22,21:0.223,22:0.227,23:0.231,24:0.235};

bot.start((ctx) => { ctx.reply('Привіт! Введи суму кредиту:'); userData.delete(ctx.chat.id); });

bot.on('text', (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  if (!userData.has(chatId)) {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) return ctx.reply('Введи правильну суму (наприклад, 10000).');
    userData.set(chatId, { amount });

    const keys = Object.keys(rates);
    const buttons = [];
    for (let i = 0; i < keys.length; i += 3) {
      buttons.push(keys.slice(i, i + 3).map(m => Markup.button.callback(`${m}`, `term_${m}`)));
    }
    return ctx.reply('Оберіть строк кредиту:', Markup.inlineKeyboard(buttons));
  }
  ctx.reply('Спочатку оберіть строк із кнопок ⬇️');
});

bot.action(/term_(\d+)/, async (ctx) => {
  const months = parseInt(ctx.match[1]);
  const chatId = ctx.chat.id;
  const data = userData.get(chatId);
  if (!data) return ctx.reply('Спочатку введи суму кредиту.');
  const rate = rates[months];
  const finalSum = data.amount + data.amount * rate;
  await ctx.reply(`Сума: ${data.amount.toFixed(2)} грн\nСтрок: ${months} міс.\nСтавка: ${(rate*100).toFixed(2)}%\nВсього: ${finalSum.toFixed(2)} грн`);
  userData.delete(chatId);
  setTimeout(() => ctx.reply('Введи нову суму для розрахунку:'), 500);
});

// Serverless handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
    catch (err) { console.error(err); res.status(500).send('Error'); }
  } else { res.status(405).send('Method Not Allowed'); }
}
