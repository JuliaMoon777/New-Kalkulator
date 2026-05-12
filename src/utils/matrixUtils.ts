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
  
  // Intermediate points
  A1: number; // A+E
  A2: number; // A+A1
  B1: number; // B+E
  B2: number; // B+B1
  C1: number; // C+E
  C2: number; // C+C1
  D1: number; // D+E
  D2: number; // D+D1

  F1: number; // F+E
  G1: number; // G+E
  H1: number; // H+E
  I1: number; // I+E
  
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
  love1: number;
  love2: number;
  money: number;
  money1: number;
  money2: number;
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
  let result = Math.abs(num);
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

  // Intermediate Cross Points
  const A1 = reduceTo22(A + E);
  const A2 = reduceTo22(A + A1);
  const B1 = reduceTo22(B + E);
  const B2 = reduceTo22(B + B1);
  const C1 = reduceTo22(C + E);
  const C2 = reduceTo22(C + C1);
  const D1 = reduceTo22(D + E);
  const D2 = reduceTo22(D + D1);

  // Ancestral Intermediate
  const F1 = reduceTo22(F + E);
  const G1 = reduceTo22(G + E);
  const H1 = reduceTo22(H + E);
  const I1 = reduceTo22(I + E);

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

  // Love Line (between E and H)
  const love = reduceTo22(E + H); // Entry point
  const love1 = reduceTo22(E + love);
  const love2 = reduceTo22(H + love);

  // Money Line (between E and G)
  const money = reduceTo22(E + G); // Entry point
  const money1 = reduceTo22(E + money);
  const money2 = reduceTo22(G + money);

  const karmic = reduceTo22(D + I);

  const chakras: ChakraData[] = [
    { name: "Sahasrara", physics: A, energy: B, emotion: reduceTo22(A + B) },
    { name: "Ajna", physics: A2, energy: B2, emotion: reduceTo22(A2 + B2) },
    { name: "Vishuddha", physics: A1, energy: B1, emotion: reduceTo22(A1 + B1) },
    { name: "Anahata", physics: E, energy: E, emotion: reduceTo22(E + E) },
    { name: "Manipura", physics: C1, energy: D1, emotion: reduceTo22(C1 + D1) },
    { name: "Svadhistana", physics: C2, energy: D2, emotion: reduceTo22(C2 + D2) },
    { name: "Muladhara", physics: C, energy: D, emotion: reduceTo22(C + D) },
  ];

  return { 
    A, B, C, D, E, F, G, H, I, 
    A1, A2, B1, B2, C1, C2, D1, D2,
    F1, G1, H1, I1,
    sky, earth, personal,
    male, female, social, 
    spiritual, planetary,
    ancestralStrength, internalPower,
    love, love1, love2, money, money1, money2, karmic, chakras 
  };
}

export function calculateCompatibility(m1: MatrixData, m2: MatrixData): MatrixData {
  const combine = (p1: number, p2: number) => reduceTo22(p1 + p2);
  
  const base: any = {};
  const keys = Object.keys(m1).filter(k => k !== 'chakras');
  keys.forEach(key => {
    base[key] = combine((m1 as any)[key], (m2 as any)[key]);
  });

  const chakras = m1.chakras.map((c, i) => ({
    name: c.name,
    physics: combine(c.physics, m2.chakras[i].physics),
    energy: combine(c.energy, m2.chakras[i].energy),
    emotion: combine(c.emotion, m2.chakras[i].emotion),
  }));

  return { ...base, chakras } as MatrixData;
}

export const ARCANA_NAMES: Record<number, string> = {
  1: 'Mag',
  2: 'Kapłanka',
  3: 'Cesarzowa',
  4: 'Cesarz',
  5: 'Hierofant',
  6: 'Kochankowie',
  7: 'Rydwan',
  8: 'Sprawiedliwość',
  9: 'Eremita',
  10: 'Koło Fortuny',
  11: 'Moc',
  12: 'Wisielec',
  13: 'Śmierć',
  14: 'Umiarkowanie',
  15: 'Diabeł',
  16: 'Wieża',
  17: 'Gwiazda',
  18: 'Księżyc',
  19: 'Słońce',
  20: 'Sąd',
  21: 'Świat',
  22: 'Głupiec',
};

export interface ArcanaGuide {
  keywords: string;
  advice: string;
}

export const ARCANA_GUIDE: Record<number, ArcanaGuide> = {
  1: { keywords: "Manifestacja, Potencjał, Energia", advice: "Twoja siła tkwi w unikalnych pomysłach. Nie czekaj na idealny moment, kreuj go sam." },
  2: { keywords: "Intuicja, Obserwacja, Tajemnica", advice: "Rozwijaj umiejętność słuchania tego, co niewypowiedziane. Twoja dyplomacja otworzy zamknięte drzwi." },
  3: { keywords: "Obfitość, Troska, Komfort", advice: "Pozwól sobie na luksus i piękno. Twoja energia rozkwita, gdy dbasz o harmonię w swoim otoczeniu." },
  4: { keywords: "Odpowiedzialność, Porządek, Skala", advice: "Buduj trwałe struktury. Twoja zdolność do zarządzania chaosem to fundament Twojego sukcesu." },
  5: { keywords: "Wiedza, Zasady, Komunikacja", advice: "Bądź wiecznym uczniem i hojnym nauczycielem. Twoje słowa niosą mądrość, która jednoczy ludzi." },
  6: { keywords: "Relacje, Estetyka, Wybór", advice: "Podążaj za tym, co kochasz. Prawdziwe spełnienie znajdziesz w autentyczności, nie w perfekcji." },
  7: { keywords: "Cele, Ruch, Dynamika", advice: "Skoncentruj się na jednym kierunku. Twoja determinacja i szybkość działania doprowadzą Cię do zwycięstwa." },
  8: { keywords: "Zrozumienie, Prawo, Równowaga", advice: "Analizuj związki przyczynowo-skutkowe. Uczciwość wobec siebie to Twoja największa ochrona." },
  9: { keywords: "Głębia, Samowystarczalność, Spokój", advice: "Czerp siłę z ciszy. Twoja wewnętrzna mądrość potrzebuje przestrzeni, by w pełni się zamanifestować." },
  10: { keywords: "Przepływ, Szczęście, Lekkość", advice: "Zaufaj rytmowi życia. Jesteś pod opieką losu – pozwól się prowadzić sprzyjającym okolicznościom." },
  11: { keywords: "Siła Vitalna, Pasja, Praca", advice: "Zarządzaj swoim ogromnym potencjałem energetycznym. Twoja pasja jest katalizatorem wielkich zmian." },
  12: { keywords: "Służba, Empatia, Innowacja", advice: "Spójrz na świat niestandardowo. Pomagając innym, odkrywasz nowe, rewolucyjne sposoby działania." },
  13: { keywords: "Odnowa, Odwaga, Transformacja", advice: "Nie bój się puszczać przeszłości. Każdy koniec jest początkiem czegoś znacznie większego." },
  14: { keywords: "Umiar, Sztuka, Cierpliwość", advice: "Dąż do emocjonalnej równowagi. Twoja zdolność do łączenia sprzeczności tworzy unikalną wartość." },
  15: { keywords: "Magnetyzm, Charyzma, Psychologia", advice: "Zaakceptuj swoje cienie. Twoja siła przyciągania rośnie, gdy jesteś świadomy swoich instynktów." },
  16: { keywords: "Oczyszczenie, Przebudzenie, Prawda", advice: "Buduj na skale, nie na piasku. Nawet gwałtowne zmiany służą Twojemu najwyższemu dobru." },
  17: { keywords: "Gwiazda, Marzenia, Kreatywność", advice: "Wierz w swoją unikalność. Twoja droga jest rozświetlona – nie bój się świecić najjaśniejszym światłem." },
  18: { keywords: "Podświadomość, Wizualizacja, Magia", advice: "Opanuj swoje lęki poprzez twórczość. Twoje myśli materializują się szybciej, niż sądzisz." },
  19: { keywords: "Sukces, Radość, Społeczność", advice: "Dziel się swoim entuzjazmem. Twoje wewnętrzne słońce ma moc uzdrawiania i inspirowania tłumów." },
  20: { keywords: "Dziedzictwo, Rodzina, Powołanie", advice: "Czerp z korzeni, by sięgnąć chmur. Jesteś ważnym ogniwem w łańcuchu pokoleń." },
  21: { keywords: "Ekspansja, Tolerancja, Nowoczesność", advice: "Nie stawiaj sobie barier. Cały świat jest Twoim domem, a każda kultura źródłem inspiracji." },
  22: { keywords: "Wolność, Entuzjazm, Nowy Etap", advice: "Zacznij z lekkim sercem. Każdy krok w nieznane to przygoda, która wzbogaca Twoją duszę." },
};
