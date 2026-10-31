import {
  generateAlgebraQuestion,
  generateTemperatureQuestion,
  generateQuadraticQuestion,
  generateGasLawQuestion,
  generateInterestQuestion,
  generateOhmsLawQuestion,
  generateHydrostaticQuestion,
  generateChemistryValencyQuestion,
  generateBoardSaqQuestion,
  generateExamPaperProcedural
} from './proceduralQuestionEngine.js';

export function runProceduralTests() {
  const results = [];

  // Test 1: Algebra
  try {
    const qAlg = generateAlgebraQuestion(101);
    const valid = qAlg && qAlg.question && qAlg.correctAnswer && qAlg.solutionSteps.length > 0;
    results.push({ name: 'Algebra Generator', passed: !!valid, details: qAlg.title });
  } catch (err) {
    results.push({ name: 'Algebra Generator', passed: false, error: err.message });
  }

  // Test 2: Temperature C/5 = (F-32)/9
  try {
    const qTemp = generateTemperatureQuestion(202);
    const valid = qTemp && qTemp.question && qTemp.correctAnswer && qTemp.solutionSteps.length > 0;
    results.push({ name: 'Temperature Converter', passed: !!valid, details: qTemp.title });
  } catch (err) {
    results.push({ name: 'Temperature Converter', passed: false, error: err.message });
  }

  // Test 3: Quadratic equation
  try {
    const qQuad = generateQuadraticQuestion(303);
    const valid = qQuad && qQuad.question.includes('x²') && qQuad.correctAnswer.includes('x =');
    results.push({ name: 'Quadratic Solver', passed: !!valid, details: qQuad.question });
  } catch (err) {
    results.push({ name: 'Quadratic Solver', passed: false, error: err.message });
  }

  // Test 4: Gas law (Boyle)
  try {
    const qGas = generateGasLawQuestion(404);
    const valid = qGas && qGas.correctAnswer.includes('cm³') && qGas.options.length === 4;
    results.push({ name: 'Boyle Gas Law', passed: !!valid, details: qGas.correctAnswer });
  } catch (err) {
    results.push({ name: 'Boyle Gas Law', passed: false, error: err.message });
  }

  // Test 5: Interest
  try {
    const qInt = generateInterestQuestion(505);
    const valid = qInt && qInt.correctAnswer.includes('সুদ = ₹') && qInt.correctAnswer.includes('সুদ-আসল = ₹');
    results.push({ name: 'Interest Calculator', passed: !!valid, details: qInt.correctAnswer });
  } catch (err) {
    results.push({ name: 'Interest Calculator', passed: false, error: err.message });
  }

  // Test 6: Ohm's Law
  try {
    const qOhm = generateOhmsLawQuestion(606);
    const valid = qOhm && qOhm.correctAnswer.includes('V') && qOhm.options.length === 4;
    results.push({ name: "Ohm's Law V=IR", passed: !!valid, details: qOhm.correctAnswer });
  } catch (err) {
    results.push({ name: "Ohm's Law V=IR", passed: false, error: err.message });
  }

  // Test 7: Hydrostatic Pressure P = hρg
  try {
    const qHyd = generateHydrostaticQuestion(707);
    const valid = qHyd && qHyd.correctAnswer.includes('Pa') && qHyd.marks === 3;
    results.push({ name: 'Hydrostatic Pressure P=hρg', passed: !!valid, details: qHyd.correctAnswer });
  } catch (err) {
    results.push({ name: 'Hydrostatic Pressure P=hρg', passed: false, error: err.message });
  }

  // Test 8: Valency
  try {
    const qChem = generateChemistryValencyQuestion(808);
    const valid = qChem && qChem.correctAnswer && qChem.options.length >= 3;
    results.push({ name: 'Valency & Formulas', passed: !!valid, details: qChem.correctAnswer });
  } catch (err) {
    results.push({ name: 'Valency & Formulas', passed: false, error: err.message });
  }

  // Test 9: Batch exam generation
  try {
    const paper = generateExamPaperProcedural({ classLevel: 'Class 10', count: 5, seed: 999 });
    const valid = paper && paper.questions.length === 5 && paper.totalMarks > 0;
    results.push({ name: 'Batch Exam Paper Synthesizer', passed: !!valid, details: `Total Marks: ${paper.totalMarks}` });
  } catch (err) {
    results.push({ name: 'Batch Exam Paper Synthesizer', passed: false, error: err.message });
  }

  return results;
}
