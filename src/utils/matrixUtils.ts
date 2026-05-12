/**
 * Utility for Matrix of Destiny calculations based on the 22 Arcana system.
 */

export interface MatrixData {
  A: number; // Day
  B: number; // Month
  C: number; // Year
  D: number; // A+B+C
  E: number; // A+B+C+D (Center)
  F: number; // A+B (Ancestral TL)
  G: number; // B+C (Ancestral TR)
  H: number; // C+D (Ancestral BR)
  I: number; // D+A (Ancestral BL)
  
  // Destinies
  sky: number; // B+D
  earth: number; // A+C
  personal: number; // sky+earth
  
  male: number; // F+H
  female: number; // G+I
  social: number; // male+female
  
  spiritual: number; // personal+social
  planetary: number; // social+spiritual
  
  ancestralStrength: number; // F+G+H+I
  internalPower: number; // Center E
  
  love: number;
  money: number;
  karmic: number;
  chakras: ChakraData[];
}

export interface ChakraData {
  name: string;
  physics: number;
  energy: number;
  emotion: number;
}

/**
 * Reduces a number to the 1-22 range.
 */
export function reduceTo22(num: number): number {
  if (num === 0) return 0;
  let result = num;
  while (result > 22) {
    result = String(result)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  return result;
}

/**
 * Calculates age based on birthdate string (DD.MM.YYYY)
 */
export function calculateAge(dob: string): number {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dob)) return 0;
  const [day, month, year] = dob.split('.').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function calculateMatrix(birthdate: string): MatrixData {
  const [day, month, year] = birthdate.split('.').map(Number);
  
  const A = reduceTo22(day);
  const B = reduceTo22(month);
  
  const cSum = String(year).split('').reduce((acc, digit) => acc + Number(digit), 0);
  const C = reduceTo22(cSum);
  
  const D = reduceTo22(A + B + C);
  const E = reduceTo22(A + B + C + D);
  
  const F = reduceTo22(A + B);
  const G = reduceTo22(B + C);
  const H = reduceTo22(C + D);
  const I = reduceTo22(D + A);

  const sky = reduceTo22(B + D);
  const earth = reduceTo22(A + C);
  const personal = reduceTo22(sky + earth);

  const male = reduceTo22(F + H);
  const female = reduceTo22(G + I);
  const social = reduceTo22(male + female);

  const spiritual = reduceTo22(personal + social);
  const planetary = reduceTo22(social + spiritual);

  const ancestralStrength = reduceTo22(F + G + H + I);
  const internalPower = E;

  const love = reduceTo22(E + H); 
  const money = reduceTo22(E + G);
  const karmic = reduceTo22(D + I);

  const chakras: ChakraData[] = [
    { name: "Sahasrara", physics: B, energy: F, emotion: reduceTo22(B + F) },
    { name: "Ajna", physics: reduceTo22(A + B), energy: reduceTo22(E + B), emotion: reduceTo22(reduceTo22(A + B) + reduceTo22(E + B)) },
    { name: "Vishuddha", physics: A, energy: E, emotion: reduceTo22(A + E) },
    { name: "Anahata", physics: reduceTo22(A + D), energy: reduceTo22(E + D), emotion: reduceTo22(reduceTo22(A + D) + reduceTo22(E + D)) },
    { name: "Manipura", physics: E, energy: E, emotion: E },
    { name: "Svadhistana", physics: reduceTo22(C + D), energy: reduceTo22(E + D), emotion: reduceTo22(reduceTo22(C + D) + reduceTo22(E + D)) },
    { name: "Muladhara", physics: D, energy: C, emotion: reduceTo22(D + C) },
  ];

  return { 
    A, B, C, D, E, F, G, H, I, 
    sky, earth, personal,
    male, female, social, 
    spiritual, planetary,
    ancestralStrength, internalPower,
    love, money, karmic, chakras 
  };
}

export function calculateCompatibility(m1: MatrixData, m2: MatrixData): MatrixData {
  const combine = (p1: number, p2: number) => reduceTo22(p1 + p2);
  
  const base = {
    A: combine(m1.A, m2.A),
    B: combine(m1.B, m2.B),
    C: combine(m1.C, m2.C),
    D: combine(m1.D, m2.D),
    E: combine(m1.E, m2.E),
    F: combine(m1.F, m2.F),
    G: combine(m1.G, m2.G),
    H: combine(m1.H, m2.H),
    I: combine(m1.I, m2.I),
    
    sky: combine(m1.sky, m2.sky),
    earth: combine(m1.earth, m2.earth),
    personal: combine(m1.personal, m2.personal),
    
    male: combine(m1.male, m2.male),
    female: combine(m1.female, m2.female),
    social: combine(m1.social, m2.social),
    
    spiritual: combine(m1.spiritual, m2.spiritual),
    planetary: combine(m1.planetary, m2.planetary),
    
    ancestralStrength: combine(m1.ancestralStrength, m2.ancestralStrength),
    internalPower: combine(m1.internalPower, m2.internalPower),

    love: combine(m1.love, m2.love),
    money: combine(m1.money, m2.money),
    karmic: combine(m1.karmic, m2.karmic),
  };

  const chakras = m1.chakras.map((c, i) => ({
    name: c.name,
    physics: combine(c.physics, m2.chakras[i].physics),
    energy: combine(c.energy, m2.chakras[i].energy),
    emotion: combine(c.emotion, m2.chakras[i].emotion),
  }));

  return { ...base, chakras };
}

export const ARCANA_NAMES: Record<number, string> = {
  1: "Mag",
  2: "Kapłanka",
  3: "Cesarzowa",
  4: "Cesarz",
  5: "Hierofant",
  6: "Kochankowie",
  7: "Rydwan",
  8: "Sprawiedliwość",
  9: "Pustelnik",
  10: "Koło Fortuny",
  11: "Siła",
  12: "Wisielec",
  13: "Śmierć",
  14: "Umiarkowanie",
  15: "Diabeł",
  16: "Wieża",
  17: "Gwiazda",
  18: "Księżyc",
  19: "Słońce",
  20: "Sąd",
  21: "Świat",
  22: "Głupiec"
};
