import { expect, test } from 'vitest';
import { Pitch } from '@model';

test('defaultPitch', () => {
  const p = new Pitch();
  expect(p).toBeInstanceOf(Pitch);
  expect(p.swara).toEqual(0);
  expect(p.oct).toEqual(0);
  expect(p.raised).toEqual(true);
  expect(p.fundamental).toEqual(261.63);
  const ratios = [
    1, 
    [2 ** (1 / 12), 2 ** (2 / 12)],
    [2 ** (3 / 12), 2 ** (4 / 12)],
    [2 ** (5 / 12), 2 ** (6 / 12)],
    2 ** (7 / 12),
    [2 ** (8 / 12), 2 ** (9 / 12)],
    [2 ** (10 / 12), 2 ** (11 / 12)]
  ]
  expect(p.ratios).toEqual(ratios);
  expect(p.logOffset).toEqual(0);
  expect(p.frequency).toEqual(261.63);
  expect(p.nonOffsetFrequency).toEqual(261.63);
  const logFreq = Math.log2(261.63);
  expect(p.nonOffsetLogFreq).toEqual(logFreq);
  expect(p.logFreq).toEqual(logFreq);
  expect(p.sargamLetter).toEqual('S');
  expect(p.octavedSargamLetter).toEqual('S');
  expect(p.numberedPitch).toEqual(0);
  expect(p.chroma).toEqual(0);
  expect(p.toJSON()).toEqual({
    swara: 0,
    raised: true,
    oct: 0,
    ratios: ratios,
    fundamental: 261.63,
    logOffset: 0,
  })
});

test('swaraInput', () => {
  const saTest = (p: Pitch) => {
    const saFreq = 261.63;
    const saLogFreq = Math.log2(saFreq);
    expect(p.swara).toEqual(0);
    expect(p.frequency).toEqual(saFreq);
    expect(p.logFreq).toEqual(saLogFreq);
    expect(p.sargamLetter).toEqual('S');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(0);
  };
  const reLoweredTest = (p: Pitch) => {
    const reFreq = 277.19;
    const reLogFreq = Math.log2(reFreq);
    expect (p.swara).toEqual(1);
    expect(p.frequency).toBeCloseTo(reFreq);
    expect(p.logFreq).toBeCloseTo(reLogFreq);
    expect(p.sargamLetter).toEqual('r');
    expect(p.raised).toEqual(false);
    expect(p.chroma).toEqual(1);
  }
  const reRaisedTest = (p: Pitch) => {
    const reFreq = 293.67;
    const reLogFreq = Math.log2(reFreq);
    expect (p.swara).toEqual(1);
    expect(p.frequency).toBeCloseTo(reFreq);
    expect(p.logFreq).toBeCloseTo(reLogFreq);
    expect(p.sargamLetter).toEqual('R');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(2);
  }
  const gaLoweredTest = (p: Pitch) => {
    const gaFreq = 311.13;
    const gaLogFreq = Math.log2(gaFreq);
    expect (p.swara).toEqual(2);
    expect(p.frequency).toBeCloseTo(gaFreq);
    expect(p.logFreq).toBeCloseTo(gaLogFreq);
    expect(p.sargamLetter).toEqual('g');
    expect(p.raised).toEqual(false);
    expect(p.chroma).toEqual(3);
  }
  const gaRaisedTest = (p: Pitch) => {
    const gaFreq = 329.63;
    const gaLogFreq = Math.log2(gaFreq);
    expect (p.swara).toEqual(2);
    expect(p.frequency).toBeCloseTo(gaFreq);
    expect(p.logFreq).toBeCloseTo(gaLogFreq);
    expect(p.sargamLetter).toEqual('G');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(4);
  }
  const maLoweredTest = (p: Pitch) => {
    const maFreq = 349.23;
    const maLogFreq = Math.log2(maFreq);
    expect (p.swara).toEqual(3);
    expect(p.frequency).toBeCloseTo(maFreq);
    expect(p.logFreq).toBeCloseTo(maLogFreq);
    expect(p.sargamLetter).toEqual('m');
    expect(p.raised).toEqual(false);
    expect(p.chroma).toEqual(5);
  }
  const maRaisedTest = (p: Pitch) => {
    const maFreq = 370;
    const maLogFreq = Math.log2(maFreq);
    expect (p.swara).toEqual(3);
    expect(p.frequency).toBeCloseTo(maFreq);
    expect(p.logFreq).toBeCloseTo(maLogFreq);
    expect(p.sargamLetter).toEqual('M');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(6);
  }
  const paTest = (p: Pitch) => {
    const paFreq = 392;
    const paLogFreq = Math.log2(paFreq);
    expect (p.swara).toEqual(4);
    expect(p.frequency).toBeCloseTo(paFreq);
    expect(p.logFreq).toBeCloseTo(paLogFreq);
    expect(p.sargamLetter).toEqual('P');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(7);

  }
  const dhaLoweredTest = (p: Pitch) => {
    const dhaFreq = 415.31;
    const dhaLogFreq = Math.log2(dhaFreq);
    expect (p.swara).toEqual(5);
    expect(p.frequency).toBeCloseTo(dhaFreq);
    expect(p.logFreq).toBeCloseTo(dhaLogFreq);
    expect(p.sargamLetter).toEqual('d');
    expect(p.raised).toEqual(false);
    expect(p.chroma).toEqual(8);
  }
  const dhaRaisedTest = (p: Pitch) => {
    const dhaFreq = 440.01;
    const dhaLogFreq = Math.log2(dhaFreq);
    expect (p.swara).toEqual(5);
    expect(p.frequency).toBeCloseTo(dhaFreq);
    expect(p.logFreq).toBeCloseTo(dhaLogFreq);
    expect(p.sargamLetter).toEqual('D');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(9);
  }
  const niLoweredTest = (p: Pitch) => {
    const niFreq = 466.17;
    const niLogFreq = Math.log2(niFreq);
    expect (p.swara).toEqual(6);
    expect(p.frequency).toBeCloseTo(niFreq);
    expect(p.logFreq).toBeCloseTo(niLogFreq);
    expect(p.sargamLetter).toEqual('n');
    expect(p.raised).toEqual(false);
    expect(p.chroma).toEqual(10);
  }
  const niRaisedTest = (p: Pitch) => {
    const niFreq = 493.89;
    const niLogFreq = Math.log2(niFreq);
    expect (p.swara).toEqual(6);
    expect(p.frequency).toBeCloseTo(niFreq);
    expect(p.logFreq).toBeCloseTo(niLogFreq);
    expect(p.sargamLetter).toEqual('N');
    expect(p.raised).toEqual(true);
    expect(p.chroma).toEqual(11);
  }

  const saVars = ['Sa', 'sa', 's', 'S', 0]
  saVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    saTest(p);
    p = new Pitch({ swara: swara, raised: false })
    saTest(p); // shouldn't matter if you pass it raised = false, will revert
    // to raised = true
  })

  const reVars = ['Re', 're', 'r', 'R', 1]
  reVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    reRaisedTest(p);
    p = new Pitch({ swara: swara, raised: false })
    reLoweredTest(p);
  })

  const gaVars = ['Ga', 'ga', 'g', 'G', 2]
  gaVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    gaRaisedTest(p);
    p = new Pitch({ swara: swara, raised: false })
    gaLoweredTest(p);
  })

  const maVars = ['Ma', 'ma', 'm', 'M', 3]
  maVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    maRaisedTest(p);
    p = new Pitch({ swara: swara, raised: false })
    maLoweredTest(p);
  })

  const paVars = ['Pa', 'pa', 'p', 'P', 4]
  paVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    paTest(p);
    p = new Pitch({ swara: swara, raised: false })
    paTest(p); // shouldn't matter if you pass it raised = false, will still be the same
  })

  const dhaVars = ['Dha', 'dha', 'd', 'D', 5]
  dhaVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    dhaRaisedTest(p);
    p = new Pitch({ swara: swara, raised: false })
    dhaLoweredTest(p);
  })

  const niVars = ['Ni', 'ni', 'n', 'N', 6]
  niVars.forEach((swara) => {
    let p = new Pitch({ swara: swara })
    niRaisedTest(p);
    p = new Pitch({ swara: swara, raised: false })
    niLoweredTest(p);
  })
})

test('octaveInput', () => {
  // Only really expecting -2 - 2 to work
  let p = new Pitch({ swara: 'Sa', oct: -2 })
  const saDown2 = 'S' + '\u0324';
  const saDown1 = 'S' + '\u0323';
  const saPlus1 = 'S' + '\u0307';
  const saPlus2 = 'S' + '\u0308';
  expect(p.oct).toEqual(-2);
  expect(p.octavedSargamLetter).toEqual(saDown2);
  p.setOct(-1)
  expect(p.oct).toEqual(-1);
  expect(p.octavedSargamLetter).toEqual(saDown1);
  p.setOct(0)
  expect(p.oct).toEqual(0);
  expect(p.octavedSargamLetter).toEqual('S');
  p.setOct(1)
  expect(p.oct).toEqual(1);
  expect(p.octavedSargamLetter).toEqual(saPlus1);
  p.setOct(2)
  expect(p.oct).toEqual(2);
  expect(p.octavedSargamLetter).toEqual(saPlus2);

})

test('logOffset', () => {
  const offset = 0.1
  let p = new Pitch({ swara: 'Sa', logOffset: offset })
  expect(p.logOffset).toEqual(offset);
  const saFreq = 261.63;
  const saLogFreq = Math.log2(saFreq);
  const offsetSaLogFreq = saLogFreq + offset;
  const offsetSaFreq = Math.pow(2, offsetSaLogFreq);
  expect(p.frequency).toBeCloseTo(offsetSaFreq);
  expect(p.logFreq).toBeCloseTo(offsetSaLogFreq);
  expect(p.nonOffsetFrequency).toBeCloseTo(saFreq);
})

test('numberedPitch', () => {
  let p = new Pitch({ swara: 5, oct: -2})
  expect(p.numberedPitch).toEqual(-15);
  p = new Pitch({ swara: 2, oct: 0})
  expect(p.numberedPitch).toEqual(4);
  p = new Pitch({ swara: 3, raised: false, oct: 1 })
  expect(p.numberedPitch).toEqual(17);
})

test('sameAs', () => {
  const p1 = new Pitch({ swara: 're', raised: false, oct: 1 });
  const p2 = new Pitch({ swara: 1, raised: false, oct: 1 });
  const p3 = new Pitch({ swara: 1, raised: true, oct: 1 });
  expect(p1.sameAs(p2)).toBe(true);
  expect(p1.sameAs(p3)).toBe(false);
})

test('fromPitchNumber and helpers', () => {
  let p = Pitch.fromPitchNumber(4);
  expect(p.swara).toEqual(2);
  expect(p.raised).toEqual(true);
  expect(p.oct).toEqual(0);

  p = Pitch.fromPitchNumber(-1);
  expect(p.swara).toEqual(6);
  expect(p.raised).toEqual(true);
  expect(p.oct).toEqual(-1);

  expect(Pitch.pitchNumberToChroma(14)).toEqual(2);
  expect(Pitch.pitchNumberToChroma(-1)).toEqual(11);

  let sd, raised;
  [sd, raised] = Pitch.chromaToScaleDegree(3);
  expect(sd).toEqual(2);
  expect(raised).toEqual(false);
  [sd, raised] = Pitch.chromaToScaleDegree(11);
  expect(sd).toEqual(6);
  expect(raised).toEqual(true);
})

test('display properties', () => {
  const pDown = new Pitch({ swara: 'g', raised: false, oct: -1 });
  expect(pDown.solfegeLetter).toEqual('Me');
  expect(pDown.octavedScaleDegree).toEqual('3\u0323');
  expect(pDown.octavedSolfegeLetter).toEqual('Me\u0323');
  expect(pDown.octavedSolfegeLetterWithCents).toEqual('Me\u0323 (+0\u00A2)');
  expect(pDown.octavedChroma).toEqual('3\u0323');
  expect(pDown.octavedChromaWithCents).toEqual('3\u0323 (+0\u00A2)');
  expect(pDown.centsString).toEqual('+0\u00A2');
  expect(pDown.a440CentsDeviation).toEqual('D#3 (+0\u00A2)');
  expect(pDown.movableCCentsDeviation).toEqual('D# (+0\u00A2)');

  const pUp = new Pitch({ swara: 'Sa', oct: 2 });
  expect(pUp.solfegeLetter).toEqual('Do');
  expect(pUp.octavedScaleDegree).toEqual('1\u0308');
  expect(pUp.octavedSolfegeLetter).toEqual('Do\u0308');
  expect(pUp.octavedSolfegeLetterWithCents).toEqual('Do\u0308 (+0\u00A2)');
  expect(pUp.octavedChroma).toEqual('0\u0308');
  expect(pUp.octavedChromaWithCents).toEqual('0\u0308 (+0\u00A2)');
  expect(pUp.centsString).toEqual('+0\u00A2');
  expect(pUp.a440CentsDeviation).toEqual('C6 (+0\u00A2)');
  expect(pUp.movableCCentsDeviation).toEqual('C (+0\u00A2)');
})

test('frequency and setOct error handling', () => {
  const p1 = new Pitch();
  (p1 as any).swara = 0;
  (p1 as any).ratios[0] = 'bad';
  expect(() => p1.frequency).toThrow(SyntaxError);
  expect(() => p1.setOct(1)).toThrow(SyntaxError);

  const p2 = new Pitch();
  (p2 as any).swara = 're';
  expect(() => p2.frequency).toThrow(SyntaxError);
  expect(() => p2.setOct(0)).toThrow(SyntaxError);

  const p3 = new Pitch();
  (p3 as any).swara = 1;
  (p3 as any).ratios[1] = 0;
  expect(() => p3.frequency).toThrow(SyntaxError);
});

test('formatted string getters across octaves', () => {
  const expected = {
    '-2': 'C2 (+0\u00A2)',
    '-1': 'C3 (+0\u00A2)',
    '0': 'C4 (+0\u00A2)',
    '1': 'C5 (+0\u00A2)',
    '2': 'C6 (+0\u00A2)'
  };
  for (let i = -2; i <= 2; i++) {
    const p = new Pitch({ swara: 'Sa', oct: i });
    expect(p.a440CentsDeviation).toEqual(expected[i]);
    expect(p.movableCCentsDeviation).toEqual('C (+0\u00A2)');
  }
});

test('chromaToScaleDegree all mappings', () => {
  const expected = [
    [0, true],
    [1, false],
    [1, true],
    [2, false],
    [2, true],
    [3, false],
    [3, true],
    [4, true],
    [5, false],
    [5, true],
    [6, false],
    [6, true],
  ];
  for (let c = 0; c < 12; c++) {
    const [sd, raised] = Pitch.chromaToScaleDegree(c);
    expect(sd).toBe(expected[c][0]);
    expect(raised).toBe(expected[c][1]);
  }
});

test('numberedPitch edge cases', () => {
  const low = new Pitch({ swara: 'Sa', oct: -3 });
  expect(low.numberedPitch).toBe(-36);
  const high = new Pitch({ swara: 'ni', raised: true, oct: 3 });
  expect(high.numberedPitch).toBe(47);
  const bad = new Pitch();
  (bad as any).swara = 7;
  expect(() => bad.numberedPitch).toThrow(SyntaxError);
});

test('constructor error conditions', () => {
  expect(() => new Pitch({ raised: 1 as any })).toThrow(SyntaxError);
  expect(() => new Pitch({ swara: [] as any })).toThrow(SyntaxError);
  expect(() => new Pitch({ swara: 'foo' })).toThrow(SyntaxError);
});

test('setOct invalid swara and ratio inputs', () => {
  const badSa = new Pitch();
  (badSa as any).swara = 0;
  (badSa as any).ratios[0] = 'bad';
  expect(() => badSa.setOct(1)).toThrow(SyntaxError);

  const badPa = new Pitch({ swara: 'pa' });
  (badPa as any).ratios[4] = null;
  expect(() => badPa.setOct(0)).toThrow(SyntaxError);

  const badNestedType = new Pitch({ swara: 're' });
  (badNestedType as any).swara = 1;
  (badNestedType as any).ratios[1] = 0;
  expect(() => badNestedType.setOct(2)).toThrow(SyntaxError);

  const wrongSwaraType = new Pitch();
  (wrongSwaraType as any).swara = 're';
  expect(() => wrongSwaraType.setOct(0)).toThrow(SyntaxError);
});

test('nonOffsetFrequency and formatted string getters', () => {
  const sa = new Pitch({ swara: 'Sa', logOffset: 0.1 });
  expect(sa.nonOffsetFrequency).toBeCloseTo(261.63);
  expect(sa.nonOffsetLogFreq).toBeCloseTo(Math.log2(261.63));
  expect(sa.centsString).toBe('+120\u00A2');
  expect(sa.a440CentsDeviation).toBe('C#4 (+20\u00A2)');
  expect(sa.movableCCentsDeviation).toBe('C (+120\u00A2)');
  expect(sa.octavedSargamLetterWithCents).toBe('S (+120\u00A2)');

  const ga = new Pitch({ swara: 'ga', raised: false, logOffset: -0.05 });
  const gaBase = 261.63 * Math.pow(2, 3 / 12);
  expect(ga.nonOffsetFrequency).toBeCloseTo(gaBase);
  expect(ga.nonOffsetLogFreq).toBeCloseTo(Math.log2(gaBase));
  expect(ga.centsString).toBe('-60\u00A2');
  expect(ga.a440CentsDeviation).toBe('D4 (+40\u00A2)');
  expect(ga.movableCCentsDeviation).toBe('D# (-60\u00A2)');
  expect(ga.octavedSargamLetterWithCents).toBe('g (-60\u00A2)');
});

test('serialization round trip', () => {
  const p = new Pitch({ swara: 'ga', raised: false, oct: 1, logOffset: 0.2 });
  const json = p.toJSON();
  const copy = Pitch.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});

test('a440CentsDeviation and movableCCentsDeviation edge octaves', () => {
  const expected: Record<string, string> = {
    '-3': 'C1 (+0\u00A2)',
    '-2': 'C2 (+0\u00A2)',
    '-1': 'C3 (+0\u00A2)',
    '0': 'C4 (+0\u00A2)',
    '1': 'C5 (+0\u00A2)',
    '2': 'C6 (+0\u00A2)',
    '3': 'C7 (+0\u00A2)',
  };
  for (let i = -3; i <= 3; i++) {
    const p = new Pitch({ swara: 'Sa', oct: i });
    expect(p.a440CentsDeviation).toEqual(expected[i]);
    expect(p.movableCCentsDeviation).toEqual('C (+0\u00A2)');
  }
});

test('octaved display strings extreme octaves', () => {
  const low = new Pitch({ swara: 'Sa', oct: -3 });
  const high = new Pitch({ swara: 'Sa', oct: 3 });
  expect(low.octavedSargamLetter).toBe('S\u20E8');
  expect(high.octavedSargamLetter).toBe('S\u20DB');
  expect(low.octavedSolfegeLetter).toBe('Do\u20E8');
  expect(high.octavedSolfegeLetter).toBe('Do\u20DB');
  expect(low.octavedChroma).toBe('0\u20E8');
  expect(high.octavedChroma).toBe('0\u20DB');
});

test('numberedPitch invalid swara values', () => {
  const p = new Pitch();
  (p as any).swara = -1;
  expect(() => p.numberedPitch).toThrow(SyntaxError);
  (p as any).swara = 7;
  expect(() => p.numberedPitch).toThrow(SyntaxError);
  (p as any).swara = 'ni';
  expect(() => p.numberedPitch).toThrow(SyntaxError);
});

test('toJSON/fromJSON preserves logOffset', () => {
  const orig = new Pitch({ swara: 'ni', raised: false, oct: 2, logOffset: -0.3 });
  const round = Pitch.fromJSON(orig.toJSON());
  expect(round.toJSON()).toEqual(orig.toJSON());
  expect(round.frequency).toBeCloseTo(orig.frequency);
});

test('invalid ratio values trigger errors', () => {
  const badRe = new Pitch({ swara: 're' });
  (badRe as any).swara = 1;
  (badRe as any).ratios[1] = 'bad';
  expect(() => badRe.frequency).toThrow(SyntaxError);
  expect(() => badRe.setOct(1)).toThrow(SyntaxError);

  const badGa = new Pitch({ swara: 'ga' });
  (badGa as any).swara = 2;
  (badGa as any).ratios[2] = 5;
  expect(() => badGa.frequency).toThrow(SyntaxError);
  expect(() => badGa.setOct(0)).toThrow(SyntaxError);
});
