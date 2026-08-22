const { object, text } = require('../middleware/validate');
const { send } = require('../utils/response');
function chat(req, res) {
  object(req.body); const message = text(req.body.message, 'message', { max: 1000 }); const context = req.body.context && typeof req.body.context === 'object' ? req.body.context : {}; const tasks = Array.isArray(context.tasks) ? context.tasks : []; const expenses = Array.isArray(context.expenses) ? context.expenses : []; const docs = Array.isArray(context.docs) ? context.docs : []; const q = message.toLowerCase(); const open = tasks.filter(task => !task.done); const rank = { high: 0, med: 1, low: 2 }; const best = [...open].sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3))[0]; const spent = expenses.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  let reply;
  if (q.includes('next') || q.includes('what should')) reply = best ? `Start with “${best.title}”. It is ${best.priority || 'medium'} priority and due ${best.due || 'soon'}.` : 'You are all caught up. Use the time for your next goal or a proper reset.';
  else if (q.includes('week')) reply = `This week you have ${open.length} open task${open.length === 1 ? '' : 's'}, ${docs.length} tracked document${docs.length === 1 ? '' : 's'}, and ₹${Math.round(spent).toLocaleString('en-IN')} in logged expenses.`;
  else reply = 'I can help connect your tasks, documents, budget, college, and plans. Ask what to do next, whether a purchase fits your budget, or for a weekly summary.';
  return send(res, 200, { reply });
}
module.exports = { chat };
