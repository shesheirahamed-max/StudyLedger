const db = require('../config/db');

const DEFAULT_WEEKLY_MENU = [
  { day_index: 0, weekday: 'শনি', morning_menu: 'ডিম ভুনা + সবজি', night_menu: 'মাছ + ভাজি' },
  { day_index: 1, weekday: 'রবি', morning_menu: 'মুরগি + শাঁক', night_menu: 'ডিম ভুনা + ডাল' },
  { day_index: 2, weekday: 'সোম', morning_menu: 'মাছ + ভাজি', night_menu: 'মুরগি + শাঁক' },
  { day_index: 3, weekday: 'মঙ্গল', morning_menu: 'ডিম ভুনা + সবজি', night_menu: 'খিচুড়ি + সালাদ + মুরগি মাংস' },
  { day_index: 4, weekday: 'বুধ', morning_menu: 'মাছ + ভাজি', night_menu: 'ডিম ভাজা + ডাল' },
  { day_index: 5, weekday: 'বৃহঃ', morning_menu: 'মুরগি + ভাজি', night_menu: 'মাছ + ভর্তা' },
  { day_index: 6, weekday: 'শুক্র', morning_menu: 'ডিম ভুনা + ডাল', night_menu: 'মুরগি + ভাজি' }
];

const DEFAULT_RULES = [
  { sort_order: 1, rule_text: 'কেউ যদি কোনো মেনু পরিবর্তন করে রান্না করতে বলে তাহলে ৫ জন সদস্যের অনুমতি নিয়ে রান্না করতে হবে, অন্যথায় ওই বাজার লিস্টে যুক্ত হবে না।' },
  { sort_order: 2, rule_text: 'নিজ দায়িত্বে কী কী বাজার আছে এবং কী কী বাজার প্রয়োজন, তা দেখে বাজার করতে হবে। সাথে সাথে লিস্ট গ্রুপে আপলোড করতে হবে।' },
  { sort_order: 3, rule_text: 'কেউ মাসে ৩ দিনের বেশি ডিম ভাজি বা নুডলস রান্না করতে পারবে না।' }
];

const DEFAULT_PHASES = [
  { phase_number: 1, phase_label: 'ধাপ ১', date_range: '১ - ৭ তারিখ', slot: 1, amount: 0, note: '' },
  { phase_number: 2, phase_label: 'ধাপ ২', date_range: '৭ - ১৪ তারিখ', slot: 2, amount: 0, note: '' },
  { phase_number: 3, phase_label: 'ধাপ ৩', date_range: '১৪ - ২১ তারিখ', slot: 3, amount: 0, note: '' },
  { phase_number: 4, phase_label: 'ধাপ ৪', date_range: '২১ - ২৮ তারিখ', slot: 4, amount: 0, note: '' },
  { phase_number: 5, phase_label: 'ধাপ ৫', date_range: '২৮ - ৩৫ তারিখ', slot: 5, amount: 0, note: '' }
];

const DEFAULT_BILLS = [
  { title: 'বাসা খরচ (ভাড়া)', amount: 0 },
  { title: 'বুয়া বিল', amount: 0 },
  { title: 'ওয়াইফাই বিল', amount: 0 },
  { title: 'বিদ্যুৎ বিল', amount: 0 },
  { title: 'গ্যাস বিল', amount: 0 }
];

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const ensureUserMessSeeded = async (userId) => {
  const existingMembers = await queryAsync(
    'SELECT * FROM mess_members WHERE user_id = ? ORDER BY member_slot ASC',
    [userId]
  );

  if (existingMembers.length === 0) {
    for (let slot = 1; slot <= 5; slot++) {
      await queryAsync(
        'INSERT INTO mess_members (user_id, member_slot, name, extra_deposit, extra_addon, extra_note) VALUES (?, ?, ?, 0, 0, "")',
        [userId, slot, `সদস্য ${slot}`]
      );
    }
  }

  const members = await queryAsync(
    'SELECT * FROM mess_members WHERE user_id = ? ORDER BY member_slot ASC',
    [userId]
  );

  const existingMenu = await queryAsync(
    'SELECT id FROM mess_weekly_menu WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (existingMenu.length === 0) {
    for (const m of DEFAULT_WEEKLY_MENU) {
      await queryAsync(
        'INSERT INTO mess_weekly_menu (user_id, day_index, weekday, morning_menu, night_menu) VALUES (?, ?, ?, ?, ?)',
        [userId, m.day_index, m.weekday, m.morning_menu, m.night_menu]
      );
    }
  }

  const existingRules = await queryAsync(
    'SELECT id FROM mess_rules WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (existingRules.length === 0) {
    for (const r of DEFAULT_RULES) {
      await queryAsync(
        'INSERT INTO mess_rules (user_id, sort_order, rule_text) VALUES (?, ?, ?)',
        [userId, r.sort_order, r.rule_text]
      );
    }
  }

  const existingPhases = await queryAsync(
    'SELECT id FROM mess_bazaar_phases WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (existingPhases.length === 0) {
    for (const p of DEFAULT_PHASES) {
      const matchedMember = members.find((mem) => Number(mem.member_slot) === Number(p.slot));
      await queryAsync(
        'INSERT INTO mess_bazaar_phases (user_id, phase_number, phase_label, date_range, member_id, amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, p.phase_number, p.phase_label, p.date_range, matchedMember ? matchedMember.id : null, p.amount, p.note]
      );
    }
  }

  const existingBills = await queryAsync(
    'SELECT id FROM mess_utility_bills WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (existingBills.length === 0) {
    for (const b of DEFAULT_BILLS) {
      await queryAsync(
        'INSERT INTO mess_utility_bills (user_id, title, amount) VALUES (?, ?, ?)',
        [userId, b.title, b.amount]
      );
    }
  }

  // ৩৫ দিনের মিল শিট (সব মেম্বার ও ১-৩৫ দিন নিশ্চিত করা)
  for (let day = 1; day <= 35; day++) {
    for (const mem of members) {
      await queryAsync(
        'INSERT IGNORE INTO mess_daily_meals (user_id, day_number, member_id, meals) VALUES (?, ?, ?, 0.00)',
        [userId, day, mem.id]
      );
    }
  }
};

const buildMessStatePayload = async (userId) => {
  await ensureUserMessSeeded(userId);

  const members = await queryAsync(
    'SELECT id, member_slot, name, extra_deposit, extra_addon, extra_note FROM mess_members WHERE user_id = ? ORDER BY member_slot ASC',
    [userId]
  );

  const weeklyMenu = await queryAsync(
    'SELECT id, day_index, weekday, morning_menu, night_menu FROM mess_weekly_menu WHERE user_id = ? ORDER BY day_index ASC',
    [userId]
  );

  const rules = await queryAsync(
    'SELECT id, sort_order, rule_text FROM mess_rules WHERE user_id = ? ORDER BY sort_order ASC',
    [userId]
  );

  const bazaarPhases = await queryAsync(
    'SELECT id, phase_number, phase_label, date_range, member_id, amount, note FROM mess_bazaar_phases WHERE user_id = ? ORDER BY phase_number ASC',
    [userId]
  );

  const mealRows = await queryAsync(
    'SELECT day_number, member_id, meals FROM mess_daily_meals WHERE user_id = ? ORDER BY day_number ASC',
    [userId]
  );

  const utilityBills = await queryAsync(
    'SELECT id, title, amount FROM mess_utility_bills WHERE user_id = ? ORDER BY id ASC',
    [userId]
  );

  const mealLookup = {};
  mealRows.forEach((r) => {
    mealLookup[`${r.day_number}_${r.member_id}`] = parseFloat(r.meals) || 0;
  });

  const mealSheet35 = Array.from({ length: 35 }, (_, idx) => {
    const dayNumber = idx + 1;
    const menuItem = weeklyMenu[idx % 7] || DEFAULT_WEEKLY_MENU[idx % 7];
    const mealsByMember = {};
    members.forEach((m) => {
      mealsByMember[m.id] = mealLookup[`${dayNumber}_${m.id}`] || 0;
    });
    return {
      day: dayNumber,
      weekday: menuItem.weekday,
      morningMenu: menuItem.morning_menu,
      nightMenu: menuItem.night_menu,
      mealsByMember
    };
  });

  return {
    members: members.map((m) => ({
      id: m.id,
      slot: m.member_slot,
      name: m.name,
      extraDeposit: parseFloat(m.extra_deposit) || 0,
      extraAddOn: parseFloat(m.extra_addon) || 0,
      extraNote: m.extra_note || ''
    })),
    weeklyMenu: weeklyMenu.map((w) => ({
      id: w.id,
      dayIndex: w.day_index,
      day: w.weekday,
      morning: w.morning_menu,
      night: w.night_menu
    })),
    rules: rules.map((r) => r.rule_text),
    bazaarPhases: bazaarPhases.map((p) => ({
      id: p.id,
      phaseNumber: p.phase_number,
      phaseLabel: p.phase_label,
      dateRange: p.date_range,
      memberId: p.member_id,
      amount: parseFloat(p.amount) || 0,
      note: p.note || ''
    })),
    mealSheet35,
    utilityBills: utilityBills.map((b) => ({
      id: b.id,
      name: b.title,
      amount: parseFloat(b.amount) || 0
    }))
  };
};

// GET /api/mess/state
const getMessState = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in getMessState:', err);
    return res.status(500).json({ message: 'Failed to load mess management data' });
  }
};

// PUT /api/mess/members/:id
const updateMessMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberId = Number(req.params.id);
    const { name, extraAddOn, extraNote, extraDeposit } = req.body;

    const existing = await queryAsync(
      'SELECT * FROM mess_members WHERE id = ? AND user_id = ?',
      [memberId, userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const curr = existing[0];
    const nextName = name !== undefined ? String(name).trim() || curr.name : curr.name;
    const nextDeposit = extraDeposit !== undefined ? parseFloat(extraDeposit) || 0 : parseFloat(curr.extra_deposit) || 0;
    const nextAddOn = extraAddOn !== undefined ? parseFloat(extraAddOn) || 0 : parseFloat(curr.extra_addon) || 0;
    const nextNote = extraNote !== undefined ? String(extraNote) : (curr.extra_note || '');

    await queryAsync(
      'UPDATE mess_members SET name = ?, extra_deposit = ?, extra_addon = ?, extra_note = ? WHERE id = ? AND user_id = ?',
      [nextName, nextDeposit, nextAddOn, nextNote, memberId, userId]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in updateMessMember:', err);
    return res.status(500).json({ message: 'Failed to update mess member' });
  }
};

// PUT /api/mess/menu/:dayIndex
const updateWeeklyMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const dayIndex = Number(req.params.dayIndex);
    const { morning, night } = req.body;

    const rows = await queryAsync(
      'SELECT * FROM mess_weekly_menu WHERE user_id = ? AND day_index = ?',
      [userId, dayIndex]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Menu day not found' });
    }

    const nextMorning = morning !== undefined ? String(morning) : rows[0].morning_menu;
    const nextNight = night !== undefined ? String(night) : rows[0].night_menu;

    await queryAsync(
      'UPDATE mess_weekly_menu SET morning_menu = ?, night_menu = ? WHERE user_id = ? AND day_index = ?',
      [nextMorning, nextNight, userId, dayIndex]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in updateWeeklyMenu:', err);
    return res.status(500).json({ message: 'Failed to update weekly menu' });
  }
};

// PUT /api/mess/bazaar-phases/:phaseNumber
const updateBazaarPhase = async (req, res) => {
  try {
    const userId = req.user.id;
    const phaseNumber = Number(req.params.phaseNumber);
    const { dateRange, memberId, amount, note } = req.body;

    const rows = await queryAsync(
      'SELECT * FROM mess_bazaar_phases WHERE user_id = ? AND phase_number = ?',
      [userId, phaseNumber]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bazaar phase not found' });
    }

    const curr = rows[0];
    const nextRange = dateRange !== undefined ? String(dateRange) : curr.date_range;
    const nextMemberId = memberId !== undefined ? (memberId ? Number(memberId) : null) : curr.member_id;
    const nextAmount = amount !== undefined ? Math.max(0, parseFloat(amount) || 0) : parseFloat(curr.amount) || 0;
    const nextNote = note !== undefined ? String(note) : (curr.note || '');

    await queryAsync(
      'UPDATE mess_bazaar_phases SET date_range = ?, member_id = ?, amount = ?, note = ? WHERE user_id = ? AND phase_number = ?',
      [nextRange, nextMemberId, nextAmount, nextNote, userId, phaseNumber]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in updateBazaarPhase:', err);
    return res.status(500).json({ message: 'Failed to update bazaar phase' });
  }
};

// PUT /api/mess/meals
const updateDailyMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayNumber, memberId, meals } = req.body;

    const dNum = Number(dayNumber);
    const mId = Number(memberId);
    const mealVal = Math.max(0, parseFloat(meals) || 0);

    if (!dNum || dNum < 1 || dNum > 35 || !mId) {
      return res.status(400).json({ message: 'Invalid dayNumber or memberId' });
    }

    await queryAsync(
      `INSERT INTO mess_daily_meals (user_id, day_number, member_id, meals)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE meals = VALUES(meals)`,
      [userId, dNum, mId, mealVal]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in updateDailyMeal:', err);
    return res.status(500).json({ message: 'Failed to update daily meal' });
  }
};

// POST /api/mess/bills
const addUtilityBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Bill title is required' });
    }

    await queryAsync(
      'INSERT INTO mess_utility_bills (user_id, title, amount) VALUES (?, ?, ?)',
      [userId, String(title).trim(), Math.max(0, parseFloat(amount) || 0)]
    );

    const payload = await buildMessStatePayload(userId);
    return res.status(201).json(payload);
  } catch (err) {
    console.error('Error in addUtilityBill:', err);
    return res.status(500).json({ message: 'Failed to add utility bill' });
  }
};

// PUT /api/mess/bills/:id
const updateUtilityBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const billId = Number(req.params.id);
    const { title, amount } = req.body;

    const rows = await queryAsync(
      'SELECT * FROM mess_utility_bills WHERE id = ? AND user_id = ?',
      [billId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utility bill not found' });
    }

    const nextTitle = title !== undefined ? String(title) : rows[0].title;
    const nextAmount = amount !== undefined ? Math.max(0, parseFloat(amount) || 0) : parseFloat(rows[0].amount) || 0;

    await queryAsync(
      'UPDATE mess_utility_bills SET title = ?, amount = ? WHERE id = ? AND user_id = ?',
      [nextTitle, nextAmount, billId, userId]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in updateUtilityBill:', err);
    return res.status(500).json({ message: 'Failed to update utility bill' });
  }
};

// DELETE /api/mess/bills/:id
const deleteUtilityBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const billId = Number(req.params.id);

    await queryAsync(
      'DELETE FROM mess_utility_bills WHERE id = ? AND user_id = ?',
      [billId, userId]
    );

    const payload = await buildMessStatePayload(userId);
    return res.json(payload);
  } catch (err) {
    console.error('Error in deleteUtilityBill:', err);
    return res.status(500).json({ message: 'Failed to delete utility bill' });
  }
};

module.exports = {
  getMessState,
  updateMessMember,
  updateWeeklyMenu,
  updateBazaarPhase,
  updateDailyMeal,
  addUtilityBill,
  updateUtilityBill,
  deleteUtilityBill
};