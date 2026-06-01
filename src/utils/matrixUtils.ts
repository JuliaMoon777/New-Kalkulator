/**
 * Utility for Matrix of Destiny calculations based on the 22 Arcana system.
 */

export interface MatrixData {
  A: number; // 0 yrs
  B: number; // 20 yrs
  C: number; // 40 yrs
  D: number; // 60 yrs
  E: number; // Center
  
  // Principal Ancestral
  F: number; // 10 yrs (A+B)
  G: number; // 30 yrs (B+C)
  H: number; // 50 yrs (C+D)
  I: number; // 70 yrs (D+A)
  
  // Intermediate nodes on axes (from node towards center)
  A1: number; // A+E (closer to center)
  A2: number; // A+A1 (between A and A1)
  hearth: number; // A1+E (inner hearth)
  
  B1: number; // B+E
  B2: number; // B+B1
  hearthB: number; // B1+E
  
  C1: number; // C+E
  C2: number; // C+C1
  hearthC: number; // C1+E
  
  D1: number; // D+E
  D2: number; // D+D1
  hearthD: number; // D1+E

  // Ancestral intermediates
  F1: number; // F+E (midpoint)
  F2: number; // F+F1
  F3: number; // F1+E
  
  G1: number; // G+E (midpoint)
  G2: number; // G+G1
  G3: number; // G1+E
  
  H1: number; // H+E (midpoint)
  H2: number; // H+H1
  H3: number; // H1+E
  
  I1: number; // I+E (midpoint)
  I2: number; // I+I1
  I3: number; // I1+E
  
  // Full Perimeter Age points (64 entries for 1.25y steps)
  agePoints: Record<number, number>;

  // Love & Money Segment
  love: number;   // Relation entry (S + D1)
  love1: number;  // Shared (C1 + D1)
  love2: number;  // Relation point 2
  
  money: number;  // Money entry (S + C1)
  money1: number; // Shared (same as love1)
  money2: number; // Money point 2
  
  // Destinies
  sky: number;
  earth: number;
  personal: number;
  male: number;
  female: number;
  social: number;
  spiritual: number;
  planetary: number;
  
  ancestralStrength: number;
  internalPower: number;
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
 * Reduces a number to the 1-22 range using sum of digits repeatedly.
 * This is the standard for Matryca Przeznaczenia (Natalia Ladini).
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
  const yearSum = String(year).split('').reduce((acc, digit) => acc + Number(digit), 0);
  const C = reduceTo22(yearSum);
  const D = reduceTo22(A + B + C);
  const E = reduceTo22(A + B + C + D);
  
  const F = reduceTo22(A + B);
  const G = reduceTo22(B + C);
  const H = reduceTo22(C + D);
  const I = reduceTo22(D + A);

  // Axis Intermediate (Sequence from center: E -> point1 -> point2 -> Outer)
  const A1 = reduceTo22(A + E);   // Node closest to E
  const A2 = reduceTo22(A + A1);  // Node between A and A1
  const hearth = reduceTo22(A1 + E);
  
  const B1 = reduceTo22(B + E);
  const B2 = reduceTo22(B + B1);
  const hearthB = reduceTo22(B1 + E);
  
  const C1 = reduceTo22(C + E);
  const C2 = reduceTo22(C + C1);
  const hearthC = reduceTo22(C1 + E);
  
  const D1 = reduceTo22(D + E);
  const D2 = reduceTo22(D + D1);
  const hearthD = reduceTo22(D1 + E);

  const F1 = reduceTo22(F + E);
  const F2 = reduceTo22(F + F1);
  const F3 = reduceTo22(F1 + E);
  
  const G1 = reduceTo22(G + E);
  const G2 = reduceTo22(G + G1);
  const G3 = reduceTo22(G1 + E);
  
  const H1 = reduceTo22(H + E);
  const H2 = reduceTo22(H + H1);
  const H3 = reduceTo22(H1 + E);
  
  const I1 = reduceTo22(I + E);
  const I2 = reduceTo22(I + I1);
  const I3 = reduceTo22(I1 + E);

  // Love & Money Segment (Bottom Right quadrant)
  const love1 = reduceTo22(C1 + D1); // Center point of the line
  const love = reduceTo22(love1 + D1); // Relationship point
  const love2 = reduceTo22(love1 + love); // Extra point
  
  const money = reduceTo22(love1 + C1); // Money point
  const money1 = love1;
  const money2 = reduceTo22(love1 + money); // Extra point

  const sky = reduceTo22(B + D);
  const earth = reduceTo22(A + C);
  const personal = reduceTo22(sky + earth);
  
  const male = reduceTo22(F + H);
  const female = reduceTo22(G + I);
  const social = reduceTo22(male + female);
  
  const spiritual = reduceTo22(personal + social);
  const planetary = reduceTo22(social + spiritual);
  
  const ancestralStrength = reduceTo22(F + G + H + I);
  const internalPower = reduceTo22(A + B + C + D + E);
  
  const karmic = reduceTo22(D + D1 + D2);

  // Full Perimeter Age Points (Natalia Ladini Method: every 1.25 years)
  const agePoints: Record<number, number> = {};
  
  const cornerNodes = [
    { age: 0, val: A }, { age: 10, val: F }, { age: 20, val: B }, { age: 30, val: G },
    { age: 40, val: C }, { age: 50, val: H }, { age: 60, val: D }, { age: 70, val: I }, { age: 80, val: A }
  ];

  for (let i = 0; i < cornerNodes.length - 1; i++) {
    const n1 = cornerNodes[i];
    const n2 = cornerNodes[i+1];
    
    // Midpoint (5y)
    const mid5 = reduceTo22(n1.val + n2.val);
    agePoints[n1.age + 5] = mid5;
    
    // Quarters (2.5y)
    const q1 = reduceTo22(n1.val + mid5);
    const q2 = reduceTo22(mid5 + n2.val);
    agePoints[n1.age + 2.5] = q1;
    agePoints[n1.age + 7.5] = q2;
    
    // Eighths (1.25y)
    agePoints[n1.age + 1.25] = reduceTo22(n1.val + q1);
    agePoints[n1.age + 3.75] = reduceTo22(q1 + mid5);
    agePoints[n1.age + 6.25] = reduceTo22(mid5 + q2);
    agePoints[n1.age + 8.75] = reduceTo22(q2 + n2.val);
  }

  // Chakras mapping: Physics (Horizontal/Material) and Energy (Vertical/Spiritual)
  const chakras: ChakraData[] = [
    { name: "SAHASRARA (misja)", physics: A, energy: B, emotion: reduceTo22(A + B) },
    { name: "AJNA (los egregory)", physics: A2, energy: B2, emotion: reduceTo22(A2 + B2) },
    { name: "VISHUDDHA (postrzeganie siebie)", physics: A1, energy: B1, emotion: reduceTo22(A1 + B1) },
    { name: "ANAHATA (związki)", physics: hearth, energy: hearthB, emotion: reduceTo22(hearth + hearthB) },
    { name: "MANIPURA (status, pieniądze)", physics: E, energy: E, emotion: reduceTo22(E + E) },
    { name: "SVADHISTANA (radość)", physics: C1, energy: D1, emotion: reduceTo22(C1 + D1) },
    { name: "MULADHARA (materia, ciało)", physics: C, energy: D, emotion: reduceTo22(C + D) },
  ];

  // Add total row
  const totalPhysics = reduceTo22(chakras.reduce((s, c) => s + c.physics, 0));
  const totalEnergy = reduceTo22(chakras.reduce((s, c) => s + c.energy, 0));
  const totalEmotion = reduceTo22(totalPhysics + totalEnergy);
  
  chakras.push({
    name: "RAZEM",
    physics: totalPhysics,
    energy: totalEnergy,
    emotion: totalEmotion
  });

  return { 
    A, B, C, D, E, F, G, H, I, 
    A1, A2, hearth, B1, B2, hearthB, C1, C2, hearthC, D1, D2, hearthD,
    F1, F2, F3, G1, G2, G3, H1, H2, H3, I1, I2, I3,
    agePoints,
    love, love1, love2, money, money1, money2,
    sky, earth, personal,
    male, female, social, 
    spiritual, planetary,
    ancestralStrength, internalPower, karmic, chakras 
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
  1: 'Magik',
  2: 'Kapłanka',
  3: 'Cesarzowa',
  4: 'Cesarz',
  5: 'Kapłan',
  6: 'Kochankowie',
  7: 'Rydwan',
  8: 'Sprawiedliwość',
  9: 'Pustelnik',
  10: 'Koło Fortuny',
  11: 'Siła',
  12: 'Wisielec',
  13: 'Śmierć',
  14: 'Umiarkowanie',
  15: 'Diabeł',
  16: 'Wieża',
  17: 'Gwiazda',
  18: 'Księżyc',
  19: 'Słońce',
  20: 'Sąd Ostateczny',
  21: 'Świat',
  22: 'Głupiec',
};

export interface ArcanaGuide {
  keywords: string;
  advice: string;
  coupleAdvice: string;
}

export const ARCANA_GUIDE: Record<number, ArcanaGuide> = {
  1: { keywords: "Manifestacja, Potencjał, Energia", advice: "Twoja siła tkwi w unikalnych pomysłach. Nie czekaj na idealny moment, kreuj go sam.", coupleAdvice: "Wspólnie twórzcie nowe projekty. Szacunek dla indywidualności lidera w związku jest kluczem." },
  2: { keywords: "Intuicja, Obserwacja, Tajemnica", advice: "Rozwijaj umiejętność słuchania tego, co niewypowiedziane. Twoja dyplomacja otworzy zamknięte drzwi.", coupleAdvice: "Budujcie związek na zaufaniu i intuicji. Unikajcie głośnych konfliktów na rzecz spokojnej rozmowy." },
  3: { keywords: "Obfitość, Troska, Komfort", advice: "Pozwól sobie na luksus i piękno. Twoja energia rozkwita, gdy dbasz o harmonię w swoim otoczeniu.", coupleAdvice: "Związek oparty na komforcie i tradycyjnych wartościach. Dbajcie o ognisko domowe i finanse." },
  4: { keywords: "Odpowiedzialność, Porządek, Skala", advice: "Buduj trwałe struktury. Twoja zdolność do zarządzania chaosem to fundament Twojego sukcesu.", coupleAdvice: "Ustalcie jasne zasady i cele. Stabilizacja i poczucie bezpieczeństwa to fundament Waszej relacji." },
  5: { keywords: "Wiedza, Zasady, Komunikacja", advice: "Bądź wiecznym uczniem i hojnym nauczycielem. Twoje słowa niosą mądrość, która jednoczy ludzi.", coupleAdvice: "Dzielcie się wiedzą i wspólnymi wartościami. Ważne jest, abyście mieli wspólnego nauczyciela lub hobby." },
  6: { keywords: "Relacje, Estetyka, Wybór", advice: "Podążaj za tym, co kochasz. Prawdziwe spełnienie znajdziesz w autentyczności, nie w perfekcji.", coupleAdvice: "Związek pełen romantyzmu i piękna. Celebrujcie wspólne chwile i dbajcie o wizualną stronę życia." },
  7: { keywords: "Cele, Ruch, Dynamika", advice: "Skoncentruj się na jednym kierunku. Twoja determinacja i szybkość działania doprowadzą Cię do zwycięstwa.", coupleAdvice: "Podróżujcie i realizujcie wspólne ambicje. Dynamika i wspólne cele napędzają Waszą miłość." },
  8: { keywords: "Zrozumienie, Prawo, Równowaga", advice: "Analizuj związki przyczynowo-skutkowe. Uczciwość wobec siebie to Twoja największa ochrona.", coupleAdvice: "Stawiajcie na sprawiedliwość i równy wkład. Jasne zasady pomogą uniknąć nieporozumień." },
  9: { keywords: "Głębia, Samowystarczalność, Spokój", advice: "Czerp siłę z ciszy. Twoja wewnętrzna mądrość potrzebuje przestrzeni, by w pełni się zamanifestować.", coupleAdvice: "Szanujcie nawzajem swoją potrzebę samotności. Budujcie głęboką, intelektualną więź." },
  10: { keywords: "Przepływ, Szczęście, Lekkość", advice: "Zaufaj rytmowi życia. Jesteś pod opieką losu – pozwól się prowadzić sprzyjającym okolicznościom.", coupleAdvice: "Cieszcie się życiem i nie planujcie wszystkiego na sztywno. Los Wam sprzyja, gdy płyniecie z prądem." },
  11: { keywords: "Siła Vitalna, Pasja, Praca", advice: "Zarządzaj swoim ogromnym potencjałem energetycznym. Twoja pasja jest katalizatorem wielkich zmian.", coupleAdvice: "Wspólna pasja i intensywność uczuć. Kierujcie energię na budowanie, a nie na rywalizację." },
  12: { keywords: "Służba, Empatia, Innowacja", advice: "Spójrz na świat niestandardowo. Pomagając innym, odkrywasz nowe, rewolucyjne sposoby działania.", coupleAdvice: "Wspierajcie się bezinteresownie. Wasza siła to nietuzinkowe podejście do problemów." },
  13: { keywords: "Odnowa, Odwaga, Transformacja", advice: "Nie bój się puszczać przeszłości. Każdy koniec jest początkiem czegoś znacznie większego.", coupleAdvice: "Związek, który stale się zmienia. Nie bójcie się kryzysów – one prowadzą do głębszej więzi." },
  14: { keywords: "Umiar, Sztuka, Cierpliwość", advice: "Dąż do emocjonalnej równowagi. Twoja zdolność do łączenia sprzeczności tworzy unikalną wartość.", coupleAdvice: "Harmonia i spokój. Wasza relacja to balsam dla duszy, jeśli dbacie o umiar i delikatność." },
  15: { keywords: "Magnetyzm, Charyzma, Psychologia", advice: "Zaakceptuj swoje cienie. Twoja siła przyciągania rośnie, gdy jesteś świadomy swoich instynktów.", coupleAdvice: "Pasja, pożądanie i głęboka psychologia. Nauczcie się szukać złota w swoich cieniach." },
  16: { keywords: "Oczyszczenie, Przebudzenie, Prawda", advice: "Buduj na skale, nie na piasku. Nawet gwałtowne zmiany służą Twojemu najwyższemu dobru.", coupleAdvice: "Budujcie relację na prawdzie, nawet jeśli boli. Stabilizacja przyjdzie po przejściu prób." },
  17: { keywords: "Gwiazda, Marzenia, Kreatywność", advice: "Wierz w swoją unikalność. Twoja droga jest rozświetlona – nie bój się świecić najjaśniejszym światłem.", coupleAdvice: "Inspirujcie się nawzajem. Jesteście dla siebie muzami – rozwijajcie wspólne talenty." },
  18: { keywords: "Podświadomość, Wizualizacja, Magia", advice: "Opanuj swoje lęki poprzez twórczość. Twoje myśli materializują się szybciej, niż sądzisz.", coupleAdvice: "Związek pełen magii i tajemnicy. Wspólne wizje i marzenia mają moc kreowania rzeczywistości." },
  19: { keywords: "Sukces, Radość, Społeczność", advice: "Dziel się swoim entuzjazmem. Twoje wewnętrzne słońce ma moc uzdrawiania i inspirowania tłumów.", coupleAdvice: "Promieniujcie szczęściem na innych. Duża rodzina lub szerokie grono znajomych to Wasz żywioł." },
  20: { keywords: "Dziedzictwo, Rodzina, Powołanie", advice: "Czerp z korzeni, by sięgnąć chmur. Jesteś ważnym ogniwem w łańcuchu pokoleń.", coupleAdvice: "Silne więzi rodzinne. Budujcie własny klan i szanujcie tradycje przodków obu stron." },
  21: { keywords: "Ekspansja, Tolerancja, Nowoczesność", advice: "Nie stawiaj sobie barier. Cały świat jest Twoim domem, a każda kultura źródłem inspiracji.", coupleAdvice: "Brak granic i wspólne poznawanie świata. Tolerancja i otwartość to mury Waszej twierdzy." },
  22: { keywords: "Wolność, Entuzjazm, Nowy Etap", advice: "Zacznij z lekkim sercem. Każdy krok w nieznane to przygoda, która wzbogaca Twoją duszę.", coupleAdvice: "Lekkość i humor w relacji. Pozwólcie sobie na bycie spontanicznymi i nie bójcie się nowych początków." },
};

