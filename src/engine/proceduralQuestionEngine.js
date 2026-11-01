/**
 * B.G. TUTORIAL HOME — Procedural Question Generation Engine
 * Mathematical & Scientific Question Synthesizer (WBBSE Class 7 - 10 & WBCHSE Class 11 - 12)
 * Designed for Babun Ghosh Sir (South Habra)
 * 100% Client-side, Deterministic & Procedural
 */

// Random integer between min and max (inclusive)
function randInt(min, max, seed = null) {
  if (seed !== null) {
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const PROCEDURAL_TOPICS = [
  { id: 'algebra', name: 'বীজগণিতীয় অভেদাবলী (Algebraic Identities)', classLevel: 'Class 8-10', subject: 'Mathematics' },
  { id: 'temperature', name: 'তাপমাত্রা রূপান্তর (C/5 = (F-32)/9)', classLevel: 'Class 8-9', subject: 'Physical Science' },
  { id: 'quadratic', name: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ (Quadratic Equations)', classLevel: 'Class 10', subject: 'Mathematics' },
  { id: 'gas_laws', name: 'গ্যাসের আচরণ ও বয়েলের সূত্র (P1V1 = P2V2)', classLevel: 'Class 10', subject: 'Physical Science' },
  { id: 'percentage_profit', name: 'শতকরা ও লাভ-ক্ষতি (Percentage & Profit/Loss)', classLevel: 'Class 8-9', subject: 'Mathematics' },
  { id: 'interest', name: 'সরল সুদ ও চক্রবৃদ্ধি সুদ (Simple & Compound Interest)', classLevel: 'Class 9-10', subject: 'Mathematics' },
  { id: 'ohms_law', name: 'চলতড়িৎ ও ওহমের সূত্র (V = IR, P = VI)', classLevel: 'Class 10', subject: 'Physical Science' },
  { id: 'hydrostatic', name: 'পদার্থের অবস্থা ও সান্দ্রতা (P = hρg)', classLevel: 'Class 9', subject: 'Physical Science' },
  { id: 'kinematics', name: 'গতিবিদ্যা ও বল (v = u+at, F = ma)', classLevel: 'Class 9', subject: 'Physical Science' },
  { id: 'chemistry_valency', name: 'রাসায়নিক বন্ধন ও সংকেত নির্ণয় (Valency & Chemical Formulas)', classLevel: 'Class 8-10', subject: 'Physical Science' },
  { id: 'board_saq', name: 'মাধ্যমিক ভিত্তিক সংক্ষিপ্ত প্রশ্নোত্তর (Board SAQ Practice)', classLevel: 'Class 10', subject: 'Mathematics & Science' }
];

/**
 * 1. Algebraic Identities Generator
 */
export function generateAlgebraQuestion(seed = null) {
  const a = randInt(2, 6, seed);
  const b = randInt(3, 7, seed ? seed + 1 : null);
  const type = randInt(1, 3, seed ? seed + 2 : null);

  if (type === 1) {
    // (ax + b)^2 = a^2 x^2 + 2ab x + b^2
    const a2 = a * a;
    const twoAb = 2 * a * b;
    const b2 = b * b;
    const correct = `${a2}x² + ${twoAb}x + ${b2}`;
    const distractors = [
      `${a2}x² + ${a * b}x + ${b2}`,
      `${a}x² + ${twoAb}x + ${b}`,
      `${a2}x² - ${twoAb}x + ${b2}`
    ];
    return {
      topicId: 'algebra',
      title: 'বীজগণিতীয় বর্গের বিস্তার',
      classLevel: 'Class 8',
      subject: 'Mathematics',
      type: 'MCQ',
      marks: 2,
      question: `(${a}x + ${b})² এর বীজগাণিতিক বিস্তার নির্ণয় করো:`,
      options: shuffle([correct, ...distractors]),
      correctAnswer: correct,
      solutionSteps: [
        `আমরা জানি, সূত্র: (A + B)² = A² + 2AB + B²`,
        `এখানে A = ${a}x এবং B = ${b}`,
        `সুতরাং (${a}x + ${b})² = (${a}x)² + 2 × (${a}x) × (${b}) + (${b})²`,
        `= ${a2}x² + ${twoAb}x + ${b2}`
      ]
    };
  } else if (type === 2) {
    // (a x - b)^2
    const a2 = a * a;
    const twoAb = 2 * a * b;
    const b2 = b * b;
    const correct = `${a2}x² - ${twoAb}x + ${b2}`;
    return {
      topicId: 'algebra',
      title: 'বীজগণিতীয় সূত্রের মান নির্ণয়',
      classLevel: 'Class 8',
      subject: 'Mathematics',
      type: 'Numerical',
      marks: 2,
      question: `যদি (${a}x - ${b})² হয়, তবে এর বিস্তার রূপ কি হবে?`,
      correctAnswer: correct,
      solutionSteps: [
        `সূত্র: (A - B)² = A² - 2AB + B²`,
        `= (${a}x)² - 2(${a}x)(${b}) + (${b})²`,
        `= ${a2}x² - ${twoAb}x + ${b2}`
      ]
    };
  } else {
    // a^2 - b^2 = (a-b)(a+b)
    const xVal = randInt(11, 25, seed);
    const yVal = randInt(2, 9, seed ? seed + 3 : null);
    const ans = (xVal - yVal) * (xVal + yVal);
    return {
      topicId: 'algebra',
      title: 'বর্গান্তর সূত্রের প্রয়োগ',
      classLevel: 'Class 8',
      subject: 'Mathematics',
      type: 'SAQ',
      marks: 2,
      question: `সূত্রের সাহায্যে মান নির্ণয় করো: (${xVal})² - (${yVal})²`,
      correctAnswer: `${ans}`,
      solutionSteps: [
        `সূত্র: A² - B² = (A + B)(A - B)`,
        `= (${xVal} + ${yVal}) × (${xVal} - ${yVal})`,
        `= ${xVal + yVal} × ${xVal - yVal} = ${ans}`
      ]
    };
  }
}

/**
 * 2. Temperature Conversion Generator (C/5 = (F-32)/9)
 */
export function generateTemperatureQuestion(seed = null) {
  // Pick Celsius values that yield clean Fahrenheit integers
  const cleanC = [ -40, 0, 10, 20, 25, 30, 35, 40, 50, 60, 100 ];
  const cVal = cleanC[randInt(0, cleanC.length - 1, seed)];
  const fVal = Math.round((cVal * 9) / 5 + 32);

  const isCtoF = randInt(0, 1, seed ? seed + 1 : null) === 0;

  if (isCtoF) {
    const correct = `${fVal}°F`;
    const distractors = [`${fVal + 10}°F`, `${fVal - 18}°F`, `${fVal + 5}°F`];
    return {
      topicId: 'temperature',
      title: 'সেলসিয়াস থেকে ফারেনহাইট রূপান্তর',
      classLevel: 'Class 9',
      subject: 'Physical Science',
      type: 'MCQ',
      marks: 2,
      question: `একটি বস্তুর তাপমাত্রা ${cVal}°C হলে, ফারেনহাইট স্কেলে তার পাঠ কত হবে?`,
      options: shuffle([correct, ...distractors]),
      correctAnswer: correct,
      solutionSteps: [
        `সম্পর্ক সূত্র: C / 5 = (F - 32) / 9`,
        `এখানে C = ${cVal}`,
        `${cVal} / 5 = (F - 32) / 9`,
        `${(cVal / 5) * 9} = F - 32`,
        `F = ${(cVal / 5) * 9 + 32}°F`,
        `অতএব ফারেনহাইট স্কেলে পাঠ = ${fVal}°F`
      ]
    };
  } else {
    return {
      topicId: 'temperature',
      title: 'ফারেনহাইট থেকে সেলসিয়াস নির্ণয়',
      classLevel: 'Class 9',
      subject: 'Physical Science',
      type: 'Numerical',
      marks: 3,
      question: `কোনো পাত্রের জলের তাপমাত্রা ${fVal}°F হলে, সেলসিয়াস স্কেলে তার মান কত ডিগ্রি হবে?`,
      correctAnswer: `${cVal}°C`,
      solutionSteps: [
        `সূত্র: C / 5 = (F - 32) / 9`,
        `C / 5 = (${fVal} - 32) / 9`,
        `C / 5 = ${fVal - 32} / 9 = ${(fVal - 32) / 9}`,
        `C = ${((fVal - 32) / 9) * 5}°C`,
        `অতএব সেলসিয়াসে তাপমাত্রা = ${cVal}°C`
      ]
    };
  }
}

/**
 * 3. Quadratic Equations Generator (ax^2 + bx + c = 0)
 */
export function formatQuadraticEquation(b, c) {
  let eq = 'x?';
  if (b === 1) eq += ' + x';
  else if (b === -1) eq += ' - x';
  else if (b > 1) eq += ` + ${b}x`;
  else if (b < -1) eq += ` - ${Math.abs(b)}x`;

  if (c > 0) eq += ` + ${c}`;
  else if (c < 0) eq += ` - ${Math.abs(c)}`;
  return eq + ' = 0';
}

export function formatRootFactor(r) {
  if (r === 0) return 'x';
  if (r > 0) return `(x - ${r})`;
  return `(x + ${Math.abs(r)})`;
}

export function generateQuadraticQuestion(seed = null) {
  let r1 = randInt(-5, 5, seed);
  let r2 = randInt(1, 6, seed ? seed + 1 : null);
  if (r1 === 0) r1 = -2;
  if (r1 === r2) r2 = r1 + 3;
  const b = -(r1 + r2);
  const c = r1 * r2;

  const equation = formatQuadraticEquation(b, c);
  const factor1 = formatRootFactor(r1);
  const factor2 = formatRootFactor(r2);

  return {
    topicId: 'quadratic',
    title: '??????????? ??????? ???????? ??? ???????',
    classLevel: 'Class 10',
    subject: 'Mathematics',
    type: 'SAQ',
    marks: 3,
    question: `??????? ???????? ??? ?????? ???: ${equation}`,
    correctAnswer: `x = ${r1}, ${r2}`,
    solutionSteps: [
      `??????? ??????: ${equation}`,
      `?????? ???????? (Middle Term Breakdown):`,
      `?????? ?? c = ${c}, x-?? ??? b = ${b}`,
      `??, ${factor1}${factor2} = 0`,
      `??? ${r1 >= 0 ? `x - ${r1}` : `x + ${Math.abs(r1)}`} = 0  => x = ${r1}`,
      `???? ${r2 >= 0 ? `x - ${r2}` : `x + ${Math.abs(r2)}`} = 0  => x = ${r2}`,
      `???????? ????????: ${r1} ??? ${r2}`
    ]
  };
}

/**
 * 4. Gas Laws Generator (Boyle's Law P1V1 = P2V2)
 */
export function generateGasLawQuestion(seed = null) {
  const p1 = randInt(1, 4, seed); // atm
  const v1 = randInt(3, 8, seed ? seed + 1 : null) * 100; // cm^3
  const p2Multiplier = randInt(2, 3, seed ? seed + 2 : null);
  const p2 = p1 * p2Multiplier;
  const v2 = Math.round((p1 * v1) / p2);

  const correct = `${v2} cm³`;
  const distractors = [`${v2 * 2} cm³`, `${Math.round(v2 / 2)} cm³`, `${v2 + 50} cm³`];

  return {
    topicId: 'gas_laws',
    title: 'বয়েলের সূত্রের গাণিতিক প্রয়োগ',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    type: 'MCQ',
    marks: 2,
    question: `নির্দিষ্ট উষ্ণতায় নির্দিষ্ট ভরের কোনো গ্যাসের চাপ ${p1} atm এবং আয়তন ${v1} cm³। উষ্ণতা স্থির রেখে চাপ বাড়িয়ে ${p2} atm করা হলে গ্যাসটির অন্তিম আয়তন কত হবে?`,
    options: shuffle([correct, ...distractors]),
    correctAnswer: correct,
    solutionSteps: [
      `উষ্ণতা স্থির থাকলে বয়েলের সূত্র অনুযায়ী: P₁V₁ = P₂V₂`,
      `এখানে প্রাথমিক চাপ P₁ = ${p1} atm, প্রাথমিক আয়তন V₁ = ${v1} cm³`,
      `অন্তিম চাপ P₂ = ${p2} atm, অন্তিম আয়তন V₂ = ?`,
      `সূত্রে মান বসিয়ে পাই: ${p1} × ${v1} = ${p2} × V₂`,
      `বা, V₂ = (${p1} × ${v1}) / ${p2} = ${v2} cm³`
    ]
  };
}

/**
 * 5. Simple & Compound Interest Generator
 */
export function generateInterestQuestion(seed = null) {
  const p = randInt(2, 10, seed) * 1000;
  const r = randInt(5, 12, seed ? seed + 1 : null);
  const t = randInt(2, 4, seed ? seed + 2 : null);

  const si = Math.round((p * r * t) / 100);
  const totalAmount = p + si;

  return {
    topicId: 'interest',
    title: 'সরল সুদের সূত্র প্রয়োগ',
    classLevel: 'Class 10',
    subject: 'Mathematics',
    type: 'Numerical',
    marks: 3,
    question: `বার্ষিক ${r}% সরল সুদে ₹${p} টাকার ${t} বছরের সুদ ও সুদ-আসল কত হবে?`,
    correctAnswer: `সুদ = ₹${si}, সুদ-আসল = ₹${totalAmount}`,
    solutionSteps: [
      `আমরা জানি সরল সুদের সূত্র: I = (P × r × t) / 100`,
      `এখানে মূলধন (P) = ₹${p}`,
      `বার্ষিক সুদের হার (r) = ${r}%`,
      `সময় (t) = ${t} বছর`,
      `অতএব মোট সুদ (I) = (${p} × ${r} × ${t}) / 100 = ₹${si}`,
      `সুদ-আসল = P + I = ₹${p} + ₹${si} = ₹${totalAmount}`
    ]
  };
}

/**
 * 6. Electricity & Ohm's Law (V = IR, P = VI)
 */
export function generateOhmsLawQuestion(seed = null) {
  const r = randInt(2, 20, seed); // Ohm
  const i = randInt(1, 5, seed ? seed + 1 : null); // Ampere
  const v = i * r; // Volts
  const p = v * i; // Watts

  const correct = `${v} V`;
  const distractors = [`${v + 4} V`, `${Math.max(1, v - 3)} V`, `${v * 2} V`];

  return {
    topicId: 'ohms_law',
    title: 'ওহমের সূত্রের গানিতিক গণনা (V = IR)',
    classLevel: 'Class 10',
    subject: 'Physical Science',
    type: 'MCQ',
    marks: 2,
    question: `একটি পরিবাহীর রোধ ${r} Ω। এর মধ্য দিয়ে ${i} A তড়িৎপ্রবাহ চালনা করলে পরিবাহীর দুই প্রান্তের বিভবপ্রভেদ কত হবে?`,
    options: shuffle([correct, ...distractors]),
    correctAnswer: correct,
    solutionSteps: [
      `ওহমের সূত্রানুসারে: V = I × R`,
      `এখানে পরিবাহীর রোধ (R) = ${r} Ω`,
      `তড়িৎপ্রবাহমাত্রা (I) = ${i} A`,
      `বিভবপ্রভেদ (V) = ${i} × ${r} = ${v} V (ভোল্ট)`
    ]
  };
}

/**
 * 7. Hydrostatic Pressure (P = hρg)
 */
export function generateHydrostaticQuestion(seed = null) {
  const h = randInt(2, 10, seed); // metres
  const rho = 1000; // density of water kg/m^3
  const g = 9.8; // m/s^2
  const pressure = Math.round(h * rho * g);

  return {
    topicId: 'hydrostatic',
    title: 'তরলের অভ্যন্তরে চাপ নির্ণয় (P = hρg)',
    classLevel: 'Class 9',
    subject: 'Physical Science',
    type: 'Numerical',
    marks: 3,
    question: `জলের ঘনত্ব 1000 kg/m³ এবং অভিকর্ষজ ত্বরণ g = 9.8 m/s² হলে, একটি হ্রদের জলের ${h} মিটার গভীরে তরলের চাপ কত হবে?`,
    correctAnswer: `${pressure} Pa (N/m²)`,
    solutionSteps: [
      `তরলের অভ্যন্তরে বিন্দুতে চাপের সূত্র: P = h × ρ × g`,
      `উচ্চতা / গভীরতা (h) = ${h} m`,
      `ঘনত্ব (ρ) = ${rho} kg/m³`,
      `অভিকর্ষজ ত্বরণ (g) = ${g} m/s²`,
      `চাপ (P) = ${h} × ${rho} × ${g} = ${pressure} পাস্কাল (N/m²)`
    ]
  };
}

/**
 * 8. Chemistry Valency & Chemical Formulas
 */
export function generateChemistryValencyQuestion(seed = null) {
  const pairs = [
    { cation: 'Al??', anion: 'O??', formula: 'Al?O?', name: '?????????????? ???????', cVal: 3, aVal: 2 },
    { cation: 'Mg??', anion: 'Cl?', formula: 'MgCl?', name: '????????????? ????????', cVal: 2, aVal: 1 },
    { cation: 'Na?', anion: 'SO???', formula: 'Na?SO?', name: '???????? ??????', cVal: 1, aVal: 2 },
    { cation: 'Ca??', anion: 'CO???', formula: 'CaCO?', name: '??????????? ????????', cVal: 2, aVal: 2 },
    { cation: 'Fe??', anion: 'O??', formula: 'Fe?O?', name: '????? ???????', cVal: 3, aVal: 2 },
    { cation: 'Cu??', anion: 'SO???', formula: 'CuSO?', name: '???? ??????', cVal: 2, aVal: 2 },
    { cation: 'Zn??', anion: 'SO???', formula: 'ZnSO?', name: '???? ??????', cVal: 2, aVal: 2 },
    { cation: 'K?', anion: 'OH?', formula: 'KOH', name: '????????? ?????????????', cVal: 1, aVal: 1 },
    { cation: 'Ca??', anion: 'OH?', formula: 'Ca(OH)?', name: '??????????? ?????????????', cVal: 2, aVal: 1 },
    { cation: 'Na?', anion: 'OH?', formula: 'NaOH', name: '???????? ?????????????', cVal: 1, aVal: 1 },
    { cation: 'H?', anion: 'Cl?', formula: 'HCl', name: '?????????????? ???????', cVal: 1, aVal: 1 },
    { cation: 'H?', anion: 'NO??', formula: 'HNO?', name: '???????? ???????', cVal: 1, aVal: 1 },
    { cation: 'H?', anion: 'SO???', formula: 'H?SO?', name: '????????? ???????', cVal: 1, aVal: 2 },
    { cation: 'Na?', anion: 'CO???', formula: 'Na?CO?', name: '???????? ????????', cVal: 1, aVal: 2 },
    { cation: 'Na?', anion: 'HCO??', formula: 'NaHCO?', name: '???????? ???????????', cVal: 1, aVal: 1 },
    { cation: 'NH??', anion: 'Cl?', formula: 'NH?Cl', name: '???????????? ????????', cVal: 1, aVal: 1 },
    { cation: 'Ba??', anion: 'Cl?', formula: 'BaCl?', name: '???????? ????????', cVal: 2, aVal: 1 },
    { cation: 'Ag?', anion: 'NO??', formula: 'AgNO?', name: '?????? ????????', cVal: 1, aVal: 1 },
    { cation: 'Pb??', anion: 'NO??', formula: 'Pb(NO?)?', name: '??? ????????', cVal: 2, aVal: 1 },
    { cation: 'Zn??', anion: 'Cl?', formula: 'ZnCl?', name: '???? ????????', cVal: 2, aVal: 1 },
    { cation: 'Cu??', anion: 'Cl?', formula: 'CuCl?', name: '???????? ????????', cVal: 2, aVal: 1 },
    { cation: 'Fe??', anion: 'SO???', formula: 'FeSO?', name: '????? ??????', cVal: 2, aVal: 2 },
    { cation: 'Fe??', anion: 'Cl?', formula: 'FeCl?', name: '????? ????????', cVal: 3, aVal: 1 },
    { cation: 'Al??', anion: 'SO???', formula: 'Al?(SO?)?', name: '?????????????? ??????', cVal: 3, aVal: 2 },
    { cation: 'Ca??', anion: 'Cl?', formula: 'CaCl?', name: '??????????? ????????', cVal: 2, aVal: 1 },
    { cation: 'K?', anion: 'Cl?', formula: 'KCl', name: '????????? ????????', cVal: 1, aVal: 1 },
    { cation: 'Mg??', anion: 'SO???', formula: 'MgSO?', name: '????????????? ??????', cVal: 2, aVal: 2 },
    { cation: 'Mg??', anion: 'OH?', formula: 'Mg(OH)?', name: '????????????? ?????????????', cVal: 2, aVal: 1 },
    { cation: 'Zn??', anion: 'O??', formula: 'ZnO', name: '???? ???????', cVal: 2, aVal: 2 },
    { cation: 'Cu??', anion: 'O??', formula: 'CuO', name: '???????? ???????', cVal: 2, aVal: 2 }
  ];

  const pick = pairs[randInt(0, pairs.length - 1, seed)];
  const distractors = [
    pick.formula.replace('₂', '').replace('₃', '₂'),
    pick.formula.replace('₂', '₃'),
    pick.formula + '₂'
  ].filter(f => f !== pick.formula);

  return {
    topicId: 'chemistry_valency',
    title: 'যোজ্যতা ও রাসায়নিক সংকেত গঠন',
    classLevel: 'Class 8-9',
    subject: 'Physical Science',
    type: 'MCQ',
    marks: 2,
    question: `${pick.cation} আয়ন এবং ${pick.anion} মূলক দ্বারা গঠিত যৌগটির (${pick.name}) সঠিক রাসায়নিক সংকেত কোনটি?`,
    options: shuffle([pick.formula, ...distractors.slice(0, 3)]),
    correctAnswer: pick.formula,
    solutionSteps: [
      `সংকেত গঠনের নিয়ম (Criss-Cross Rule):`,
      `ক্যাটায়নের যোজ্যতা = ${pick.cVal}, অ্যানায়নের যোজ্যতা = ${pick.aVal}`,
      `যোজ্যতা পরস্পর বিনিময় করে যৌগটির সংকেত হয়: ${pick.formula}`
    ]
  };
}

/**
 * 9. Board SAQ / Conceptual Practice (WBBSE Class 10 Standard)
 */
export function generateBoardSaqQuestion(seed = null) {
  const pool = [
    {
      q: 'আদর্শ গ্যাস সমীকরণটি লেখো এবং এর ধ্রুবক R-এর SI একক উল্লেখ করো।',
      a: 'PV = nRT; R-এর SI একক হল J·mol⁻¹·K⁻¹',
      steps: [
        'বয়েল, চার্লস ও অ্যাভোগাড্রো সূত্রের সমন্বয়ে আদর্শ গ্যাস সমীকরণ: PV = nRT',
        'যেখানে P = চাপ, V = আয়তন, n = মোল সংখ্যা, T = পরম তাপমাত্রা, R = সর্বজনীন গ্যাস ধ্রুবক।',
        'SI পদ্ধতিতে R-এর মান প্রায় 8.314 J·mol⁻¹·K⁻¹'
      ]
    },
    {
      q: 'আলোর প্রতিসরণে স্নেলের সূত্রটি বিবৃতি করো। কখন স্নেলের সূত্র প্রযোজ্য হয় না?',
      a: 'μ = sin i / sin r; লম্ব আপতনের ক্ষেত্রে (i = 0°) প্রযোজ্য হয় না।',
      steps: [
        'স্নেলের সূত্র: নির্দিষ্ট দুটি মাধ্যমের বিভেদতলে নির্দিষ্ট বর্ণের আলোর প্রতিসরণে আপতন কোণের সাইন এবং প্রতিসরণ কোণের সাইনের অনুপাত সর্বদা ধ্রুবক থাকে (sin i / sin r = ধ্রুবক = μ)।',
        'ব্যতিক্রম: যখন আলোক রশ্মি দুই মাধ্যমের বিভেদতলে লম্বভাবে আপতিত হয় (আপতন কোণ i = 0°), তখন স্নেলের সূত্র প্রযোজ্য নয়।'
      ]
    },
    {
      q: 'কোনো বৃত্তের স্পর্শক ও স্পর্শবিন্দুগামী ব্যাসার্ধের মধ্যবর্তী কোণ কত?',
      a: '90° (এক সমকোণ)',
      steps: [
        'উপপাদ্য অনুসারে: বৃত্তের কোনো বিন্দুতে অঙ্কিত স্পর্শক এবং স্পর্শবিন্দুগামী ব্যাসার্ধ পরস্পর লম্ব হয়।',
        'অতএব মধ্যবর্তী কোণ = 90° বা এক সমকোণ।'
      ]
    }
  ];

  const pick = pool[randInt(0, pool.length - 1, seed)];
  return {
    topicId: 'board_saq',
    title: 'মাধ্যমিক ধারণামূলক সংক্ষিপ্ত প্রশ্নোত্তর',
    classLevel: 'Class 10',
    subject: 'Physical Science & Math',
    type: 'SAQ',
    marks: 2,
    question: pick.q,
    correctAnswer: pick.a,
    solutionSteps: pick.steps
  };
}

/**
 * Master Procedural Question Dispatcher
 */
export function generateProceduralQuestion(topicId, seed = null) {
  switch (topicId) {
    case 'algebra':
      return generateAlgebraQuestion(seed);
    case 'temperature':
      return generateTemperatureQuestion(seed);
    case 'quadratic':
      return generateQuadraticQuestion(seed);
    case 'gas_laws':
      return generateGasLawQuestion(seed);
    case 'interest':
      return generateInterestQuestion(seed);
    case 'ohms_law':
      return generateOhmsLawQuestion(seed);
    case 'hydrostatic':
      return generateHydrostaticQuestion(seed);
    case 'chemistry_valency':
      return generateChemistryValencyQuestion(seed);
    case 'board_saq':
      return generateBoardSaqQuestion(seed);
    default:
      return generateAlgebraQuestion(seed);
  }
}

/**
 * Batch generate question paper with customizable count and topic coverage
 */
export function generateExamPaperProcedural({ classLevel = 'Class 10', topicIds = [], count = 10, seed = 42 }) {
  const chosenTopics = topicIds.length > 0 ? topicIds : ['algebra', 'temperature', 'gas_laws', 'ohms_law', 'quadratic'];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const topic = chosenTopics[i % chosenTopics.length];
    const q = generateProceduralQuestion(topic, seed + i * 17);
    questions.push({
      ...q,
      qNumber: i + 1
    });
  }

  const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 2), 0);

  return {
    title: `বি.জি. টিউটোরিয়াল হোম — বিশেষ মূল্যায়ন পরীক্ষা (${classLevel})`,
    institution: 'B.G. TUTORIAL HOME — Babun Ghosh Sir',
    date: new Date().toISOString().split('T')[0],
    classLevel,
    totalMarks,
    questions
  };
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
