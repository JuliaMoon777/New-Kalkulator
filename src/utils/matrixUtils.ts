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

export function calculateMatrixFromCore(
  A: number,
  B: number,
  C: number,
  D: number,
  E: number,
  customF?: number,
  customG?: number,
  customH?: number,
  customI?: number
): MatrixData {
  const F = customF !== undefined ? customF : reduceTo22(A + B);
  const G = customG !== undefined ? customG : reduceTo22(B + C);
  const H = customH !== undefined ? customH : reduceTo22(C + D);
  const I = customI !== undefined ? customI : reduceTo22(D + A);

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
  const totalEmotion = reduceTo22(chakras.reduce((s, c) => s + c.emotion, 0));
  
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

export function calculateMatrix(birthdate: string): MatrixData {
  const [day, month, year] = birthdate.split('.').map(Number);
  
  const A = reduceTo22(day);
  const B = reduceTo22(month);
  const yearSum = String(year).split('').reduce((acc, digit) => acc + Number(digit), 0);
  const C = reduceTo22(yearSum);
  const D = reduceTo22(A + B + C);
  const E = reduceTo22(A + B + C + D);

  return calculateMatrixFromCore(A, B, C, D, E);
}

export function calculateCompatibility(m1: MatrixData, m2: MatrixData): MatrixData {
  const combine = (p1: number, p2: number) => reduceTo22(p1 + p2);
  
  const A = combine(m1.A, m2.A);
  const B = combine(m1.B, m2.B);
  const C = combine(m1.C, m2.C);
  const D = combine(m1.D, m2.D);
  const E = combine(m1.E, m2.E);
  const F = combine(m1.F, m2.F);
  const G = combine(m1.G, m2.G);
  const H = combine(m1.H, m2.H);
  const I = combine(m1.I, m2.I);

  const baseMatrix = calculateMatrixFromCore(A, B, C, D, E, F, G, H, I);
  
  // Hearth compatibility nodes should be combined from m1 and m2
  const hearth = combine(m1.hearth, m2.hearth);
  const hearthB = combine(m1.hearthB, m2.hearthB);
  
  // Re-build chakras with correct hearth/hearthB values
  const chakras: ChakraData[] = [
    { name: "SAHASRARA (misja)", physics: baseMatrix.A, energy: baseMatrix.B, emotion: reduceTo22(baseMatrix.A + baseMatrix.B) },
    { name: "AJNA (los egregory)", physics: baseMatrix.A2, energy: baseMatrix.B2, emotion: reduceTo22(baseMatrix.A2 + baseMatrix.B2) },
    { name: "VISHUDDHA (postrzeganie siebie)", physics: baseMatrix.A1, energy: baseMatrix.B1, emotion: reduceTo22(baseMatrix.A1 + baseMatrix.B1) },
    { name: "ANAHATA (związki)", physics: hearth, energy: hearthB, emotion: reduceTo22(hearth + hearthB) },
    { name: "MANIPURA (status, pieniądze)", physics: baseMatrix.E, energy: baseMatrix.E, emotion: reduceTo22(baseMatrix.E + baseMatrix.E) },
    { name: "SVADHISTANA (radość)", physics: baseMatrix.C1, energy: baseMatrix.D1, emotion: reduceTo22(baseMatrix.C1 + baseMatrix.D1) },
    { name: "MULADHARA (materia, ciało)", physics: baseMatrix.C, energy: baseMatrix.D, emotion: reduceTo22(baseMatrix.C + baseMatrix.D) },
  ];

  // Add total row
  const totalPhysics = reduceTo22(chakras.reduce((s, c) => s + c.physics, 0));
  const totalEnergy = reduceTo22(chakras.reduce((s, c) => s + c.energy, 0));
  const totalEmotion = reduceTo22(chakras.reduce((s, c) => s + c.emotion, 0));
  
  chakras.push({
    name: "RAZEM",
    physics: totalPhysics,
    energy: totalEnergy,
    emotion: totalEmotion
  });

  return {
    ...baseMatrix,
    hearth,
    hearthB,
    chakras
  };
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

export const STATIC_MONTH_INTERPRETATIONS: Record<number, string> = {
  1: `Twoja siła płynie z unikalnych pomysłów i genialnej zdolności przekuwania myśli w rzeczywistość. Masz w sobie iskrę, która pozwala Ci rozpoczynać nowe projekty bez wysiłku. Twój umysł stale generuje innowacje, a własna przestrzeń twórcza i zapoczątkowywanie zmian idealnie ładują Twoje wewnętrzne baterie.

W codziennym życiu wyznaczaj kierunek innym, pokazując, że niemożliwe nie istnieje. Możesz zainspirować kogoś do startu własnej firmy lub po prostu podsunąć proste rozwiązanie trudnego problemu. Twoje słowa mają moc twórczą, używaj ich więc ze zrozumieniem, by wnosić w świat nową jakość i budować mosty.`,
  2: `Twoim przedziwnym darem jest niebywała intuicja i zdolność dostrzegania tego, co niewidoczne na pierwszy rzut oka. Naturalnie wyczuwasz nastroje innych ludzi i zaprowadzasz harmonię tam, gdzie panuje chaos. Ładujesz swoje akumulatory, kiedy przebywasz na łonie natury, w ciszy, słuchając swojego wewnętrznego głosu.

Wykorzystuj ten talent, działając jako naturalny dyplomata i doradca. Potrafisz wysłuchać przyjaciela bez oceniania i pomóc mu odnaleźć spokój w trudnej sytuacji. Twój dyplomatyczny dar sprawia, że ludzie czują się przy Tobie bezpieczni, a świat zyskuje dzięki Tobie więcej serdeczności i autentycznego zrozumienia.`,
  3: `Twoją istotą jest obfitość, gościnność i naturalna zdolność do opiekowania się wszystkim, co wokół Ciebie rośnie. Masz talent do tworzenia piękna i przytulnej atmosfery bez najmniejszego wysiłku. Baterie ładujesz poprzez troskę o dom, pielęgnowanie relacji z bliskimi oraz otaczanie się estetyką i komfortem.

Wnosić obfitość w codzienność możesz poprzez wspieranie innych w ich rozwoju, a także rozwijanie własnych pomysłów biznesowych lub artystycznych. Twoja obecność sprawia, że projekty i relacje rozkwitają. Bądź ostoją ciepła, twórz piękno i ciesz się każdą chwilą, bo Twoja troska czyni ten świat lepszym i bogatszym.`,
  4: `Twoja główna siła tkwi w stabilności, odpowiedzialności i niesamowitym talencie do organizowania chaosu w uporządkowane struktury. Masz w sobie naturalny autorytet, który zjednuje ludzi, a poczucie kontroli i jasno wyznaczone cele dają Ci potężny zastrzyk energii. Ładujesz się, kiedy tworzysz solidny plan.

Wykorzystaj ten talent, stając się liderem, na którym inni mogą polegać w trudnych chwilach. Może to być kierowanie zespołem w pracy lub zorganizowanie pomocy dla sąsiada. Twoje zdecydowanie i troska o porządek dają ludziom poczucie bezpieczeństwa. Buduj mądrze i z sercem, bo Twoja stabilna energia jest ostoją dla wielu.`,
  5: `Twoja wewnętrzna esencja opiera się na szacunku do tradycji, zasad i ciągłym dążeniu do wiedzy. Twoim naturalnym talentem jest umiejętność jasnego przekazywania mądrości i tłumaczenia skomplikowanych rzeczy w prosty sposób. Zgłębianie nowych dziedzin i dzielenie się wnioskami niesamowicie ładuje Twoje życiowe baterie.

Na co dzień sprawdzasz się jako wspaniały mentor, nauczyciel i przyjaciel, który zawsze służy dobrą radą. Budujesz relacje oparte na zaufaniu i wartościach duchowych, pomogając innym odnaleźć ich własną ścieżkę. Twoja wiedza porządkuje świat i wnosi w niego jasność – nieś to światło dalej z radością.`,
  6: `Twoją główną siłą jest zdolność budowania głębokich, pięknych relacji oraz naturalne dążenie do harmonii i estetyki. Rozpalasz się od środka, gdy tworzysz atmosferę miłości i akceptacji wokół siebie. Ładujesz swoje akumulatory poprzez spotkania z bliskimi, obcowanie ze sztuką oraz dbanie o przyjazne i stylowe otoczenie.

Wykorzystaj ten dar, łącząc ludzi i pomagając im dostrzegać piękno w codzienności. Możesz zaaranżować udane spotkanie towarzyskie lub pomóc komuś podjąć decyzję płynącą prosto z serca. Twoja serdeczność i otwartość sprawiają, że świat staje się cieplejszy, a ludzie wokół Ciebie czują się naprawdę ważni i docenieni.`,
  7: `Twoją wewnętrzną esencją jest ruch, determinacja i talent do osiągania wyznaczonych celów z niezwykłą odwagą. Masz w sobie iskrę zwycięzcy, która pcha Cię do przodu bez względu na przeszkody. Planowanie podróży, aktywność fizyczna oraz stawianie sobie nowych wyzwań błyskawicznie ładują Twoje wewnętrzne baterie.

W codziennym życiu inspiruj innych do działania, pokazując, jak przekuwać marzenia w rzeczywiste plany. Możesz poprowadzić wspólny projekt lub pomóc znajomemu ruszyć z miejsca, w którym utknął. Twoja dynamiczna i pozytywna siła zaraża entuzjazmem. Trzymaj mocno stery swojego życia i prowadź innych ku wspólnemu sukcesowi.`,
  8: `Twoja siła tkwi w głębokim zrozumieniu praw rządzących życiem oraz naturalnym talencie do zachowania obiektywizmu i równowagi. Potrafisz bez emocji ocenić każdą sytuację i dostrzec ukryte powiązania. Ładujesz swoje akumulatory, gdy panuje wokół Ciebie jasność, prawda i poczucie sprawiedliwości.

Na co dzień wykorzystuj ten dar do godzenia zwaśnionych stron i wprowadzania porządku tam, gdzie panuje chaos informacyjny. Pomagaj ludziom dostrzec obiektywną prawdę i spokojnie rozwiązywać spory. Twoja mądrość i uczciwość budują zaufanie, a Twoje słowo ma wielką wagę. Bądź filarem sprawiedliwości dla swojego otoczenia.`,
  9: `Twoim najcenniejszym darem jest głęboka mądrość, samowystarczalność i badawczy umysł, który potrafi dotrzeć do sedna każdej sprawy. Masz w sobie naturalny spokój, który przyciąga ludzi szukających odpowiedzi. Ładujesz baterie w chwilach samotności, podczas lektury, refleksji lub spokojnych spacerów w ciszy.

Swoją mądrość możesz nieść światu, dzieląc się przemyśleniami z tymi, którzy naprawdę tego potrzebują. Bądź dla innych oazą spokoju i cierpliwym doradcą, który pomaga dostrzec głębszy sens w codziennym biegu. Twoje refleksyjne podejście wnosi do relacji niesamowitą głębię. Dziel się swoim światłem bez pośpiechu.`,
  10: `Twoja siła polega na niesamowitym zaufaniu do życia, lekkości i umiejętności płynięcia z prądem korzystnych okoliczności. Masz talent do przyciągania szczęśliwych zbiegów okoliczności i uśmiechu losu. Twoje baterie najlepiej ładują się wtedy, gdy odpuszczasz nadmierną kontrolę i pozwalasz rzeczom dziać się naturalnie.

Wykorzystaj ten dar, ucząc innych optymizmu i elastycznego podejścia do zmian. Pokazuj ludziom wokół, że nawet niespodziewane trudności mogą przynieść nowe, wspaniałe możliwości działania. Twoja pozytywna energia wnosi lekkość w każde przedsięwzięcie. Ciesz się chwilą i zarażaj innych wiarą w szczęśliwy los.`,
  11: `Twoim głównym talentem jest ogromna siła witalna, pasja oraz niezwykła pojemność energetyczna, która pozwala Ci góry przenosić. To, co dla innych jest wyczerpujące, dla Ciebie bywa naturalnym rytmem działania. Twoje baterie ładują się poprzez aktywny wypoczynek, realizowanie wielkich zamierzeń oraz kreatywną pracę.

Używaj tej potężnej energii do wspierania słabszych i motywowania ludzi do przekraczania własnych granic. Swoim entuzjazmem możesz natchnąć zespół do wielkich osiągnięć lub podtrzymać kogoś na duchu w trudnym momencie. Twoja obecność emanuje pewnością siebie i witalnością, która rozświetla i wzmacnia świat wokół.`,
  12: `Twój unikalny talent to nieszablonowe myślenie, głęboka empatia i zdolność patrzenia na świat z zupełnie innej perspektywy niż większość ludzi. Potrafisz dostrzec rewolucyjne rozwiązania tam, gdzie inni widzą ścianę. Ładujesz akumulatory, pomagając bezinteresownie i angażując się w projekty, które przynoszą realną wartość.

W codziennym życiu wyciągaj pomocną dłoń i pokazuj bliskim nowatorskie drogi wyjścia z kłopotów. Twoja otwartość na drugiego człowieka sprawia, że ludzie czują się przy Tobie w pełni zaakceptowani. Twórz kreatywne idee i wnoś do relacji miękkość oraz zrozumienie. Twoje współczucie czyni świat cieplejszym miejscem.`,
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

export const STATIC_RELATIONSHIP_INTERPRETATIONS: Record<number, string> = {
  1: `Spotkanie partnerów pod tym znakiem ma za zadanie wzbudzić w nich wiarę, że są prawdziwymi twórcami swojego życia i że nie ma dla nich rzeczy niemożliwych. Przyszliście do siebie po to, by przestać czekać na lepszy moment, a zacząć aktywnie kreować rzeczywistość. Głównym zadaniem tego związku jest nauka równego partnerstwa bez próby zdominowania drugiej strony lub narzucania jedynej słusznej wizji. Lekcja polega na tym, by dać sobie nawzajem przestrzeń na realizację indywidualnych pomysłów.

W codziennym życiu ten układ sprzyja odważnym inicjatywom. Często możecie łapać się na tym, że jedno rzuca szalony pomysł, a drugie natychmiast go podchwytuje. Decyzje podejmujecie szybko, czasami wręcz impulsywnie, co bywa waszym atutem, ale i źródłem problemów, gdy brakuje chłodnej kalkulacji. Wasze wspólne dni wypełnia dyskusja o planach i ciągłe dążenie do ruszania z nowymi inicjatywami.

Finanse w tym sojuszu zależą bezpośrednio od waszej odwagi i wiary we własne siły. Pieniądze pojawiają się falami, zazwyczaj jako rezultat udanych, świeżych projektów. Wyzwaniem może być brak cierpliwości i tendencja do porzucania spraw w połowie drogi, zanim zaczną przynosić stabilny zysk. Jeśli jedno z was zacznie kontrolować wydatki drugiego lub gasić jego entuzjazm, przepływ obfitości zostanie zablokowany.

Związek rozkwita w pełni, gdy oboje czujecie się wolni w swoich działaniach i szanujecie swoją niezależność. Kiedy odblokujecie swój wspólny potencjał, pieniądze przestają być celem, a stają się narzędziem do urzeczywistniania śmiałych wizji. Wasza codzienność zmienia się wtedy w niekończącą się podróż, gdzie możecie bez lęku inwestować w jakość życia, realizować marzenia o podróżach i budować całkowitą niezależność materialną.`,

  2: `Ten sojusz został zawarty z głębokiej, wewnętrznej potrzeby wyczucia tego, co niewypowiedziane. Spotkaliście się, aby nauczyć się dostrzegać niuanse życia, zaufać swojej intuicji i wyjść poza powierzchowne reakcje. Najważniejszą lekcją stojącą przed wami jest wyjście z tajemnic, niedomówień i bierności. Macie nauczyć się rozmawiać o najsubtelniejszych odczuciach bez oskarżeń, tworząc bezpieczną przystań, w której nie ma miejsca na sekrety przed partnerem.

W codziennym życiu przejawia się to jako głębokie, wręcz bezsłowne porozumienie. Często wiecie, czego partner potrzebuje, zanim to powie. Cenicie sobie ciszę, bliskość natury i chwile spędzone z dala od miejskiego zgiełku. Wasze decyzje są zazwyczaj wyważone, poparte przeczuciem, ale waszym wyzwaniem bywa nadmierne wycofanie i odkładanie działań na bliżej nieokreśloną przyszłość, co może prowadzić do stagnacji.

Obszar materialny w tej relacji płynie spokojnym, jednostajnym nurtem. Pieniądze pojawiają się intuicyjnie tam i wtedy, kiedy są najbardziej potrzebne. Wyzwaniem finansowym jest jednak lęk przed podjęciem ryzyka lub niechęć do zajmowania się twardą matematyką i rachunkami. Jeśli zaczniecie ignorować rzeczywistość materialną, pojawią się opóźnienia i brak stabilności.

Trwałość tego związku zależy od dbałości o zaufanie i szczerość. Gdy odblokujecie swój potencjał obfitości, zaczyna otaczać was aura spokoju i głębokiego komfortu. Pieniądze zaczynają płynąć bez wysiłku, pozwalając wam na stworzenie przytulnego domu, czerpanie radości z prostych przyjemności i podróżowanie poza utartymi szlakami, bez presji i pośpiechu.`,

  3: `Wasza para połączyła się, aby manifestować piękno, obfitość i troskliwość w świecie materialnym. To sojusz, którego celem jest stworzenie bogatego, przytulnego mikroklimatu – dosłownie i w przenośni. Lekcją dla was jest wyzwolenie się z nadopiekuńczości, chęci nadmiernego kontrolowania partnera oraz z niezdrowego przywiązania wyłącznie do posiadania rzeczy. Uczycie się, jak dawać miłość bez stawiania warunków i jak wspólnie zarządzać ziemskimi darami.

W codziennym życiu wasz związek kręci się wokół domu, estetyki i komfortu. Uwielbiacie dbać o przestrzeń, przyjmować gości i otaczać się pięknymi przedmiotami. Decyzje podejmujecie z myślą o dobrobycie i stabilizacji rodziny. Wyzwaniem bywa skłonność do zbytniego luksusu lub rywalizacja o to, kto ma decydujący głos w codziennych sprawach, co rodzi napięcia.

Finanse to wasza mocna strona. Macie naturalną zdolność do przyciągania dobrobytu i mnożenia zasobów. Pieniądze lubią waszą relację, bo traktujecie je z szacunkiem i lekkością. Największym wyzwaniem jest skąpstwo lub z drugiej strony – niekontrolowane wydatki na zachcianki. Trwałość relacji zależy od tego, czy potraficie dzielić się zasobami bez budowania zależności finansowej.

Gdy wasza para w pełni odgrodzi się od lęków o byt i odblokuje swój potencjał obfitości, wasze życie nabiera królewskiego wymiaru. Zyskujecie pełne bezpieczeństwo materialne, a wasz dom staje się oazą luksusu i spokoju. Pojawiają się możliwości swobodnego inwestowania w nieruchomości, podróże pierwszej klasy i bezstresowe realizowanie marzeń wszystkich członków rodziny.`,

  4: `Wasz związek to potężna konstrukcja oparta na odpowiedzialności, sile charakteru i porządku. Spotkaliście się, aby zbudować trwały, stabilny fundament pod wspólne plany i nauczyć się, jak zarządzać dużymi przedsięwzięciami. Lekcją, którą musicie opanować, jest rezygnacja z bezwzględnej dominacji, sztywności zasad i agresywnej rywalizacji o władzę. Waszym zadaniem jest zamienić surowość w mądre przywództwo.

W codziennym życiu widać u was ogromną dyscyplinę. Wszystko ma swoje miejsce i czas, od budżetu po planowanie urlopu. Wasze decyzje są konkretne, pragmatyczne i ukierunkowane na daleką przyszłość. Wyzwaniem bywa jednak brak czułości i spontaniczności – kiedy życie staje się zbyt skodyfikowane, związek traci świeżość, a partnerzy mogą poczuć się jak na spotkaniu biznesowym.

Sfera finansów w tej relacji ma tendencję do stałego wzrostu. Budujecie bezpieczeństwo poprzez jasny plan i twardą kalkulację. Radzicie sobie świetnie z dużym kapitałem, ale wyzwaniem bywa nadmierne skąpstwo lub próba kontrolowania partnera za pomocą pieniędzy. Obfitość płynie najszerszym strumieniem, gdy zniknie strach przed stratą władzy finansowej.

Największe szanse na trwałość macie wtedy, gdy w relacji panuje jasny podział ról oparty na wzajemnym szacunku i braku rywalizacji. Po odblokowaniu potencjału obfitości wasze życie wchodzi na poziom całkowitej wolności finansowej. Realizujecie śmiałe, wielkie inwestycje, które dają wam niezależność na lata, otwierając drzwi do budowania trwałego dziedzictwa.`,

  5: `Wasza para spotkała się, aby wspólnie poszukiwać sensu, prawdy oraz budować życie oparte na mocnych zasadach moralnych. To związek, który uczy się głębokiej komunikacji, szacunku do odmiennych poglądów i tradycji. Waszą najważniejszą lekcją jest porzucenie roli nieomylnego sędziego, który wie wszystko najlepiej. Macie nauczyć się słuchać siebie nawzajem bez moralizowania i narzucania własnych reguł jako jedynej prawdy.

W codziennym funkcjonowaniu jesteście dla siebie nawzajem nauczycielami i uczniami. Uwielbiacie długie rozmowy, wspólne czytanie, analizowanie spraw i planowanie z dbałością o detale. Wasze decyzje są zawsze głęboko przemyślane pod kątem etycznym. Wyzwaniem bywa jednak nadmierny konserwatyzm, pedantyczność i trudność z adaptacją do nowych warunków, co może blokować wasz rozwój.

Obszar materialny w waszej relacji układa się pomyślnie, dopóki pieniądze są traktowane jako środek do realizacji wyższych celów, a nie cel sam w sobie. Szanujecie pieniądze, ale jeśli wpadniecie w pułapkę oceniania innych przez pryzmat ich portfela, przepływ finansowy natychmiast wyhamuje. Wyzwaniem bywa też lęk przed zmianami w systemie zarabiania.

Związek ma największe szanse na rozwój, gdy oboje rozwijacie się intelektualnie i duchowo, nie stojąc w miejscu. Po odblokowaniu obfitości wasza relacja emanuje spokojem i mądrością. Zyskujecie stabilność finansową, która pozwala wam na bezstresowe finansowanie edukacji, gromadzenie rzadkich dzieł, podróże do miejsc o bogatej historii i wspieranie tych, którzy tego potrzebują.`,

  6: `Ta relacja powstała, aby partnerzy mogli doświadczyć piękna, głębokiego uczucia i nauczyć się sztuki bezwarunkowego wyboru. Spotkaliście się, aby przekonać się, że prawdziwy sojusz opiera się na wolności i akceptacji partnera takim, jaki jest, a nie na poszukiwaniu idealnego obrazka. Waszą najważniejszą lekcją jest pokonanie lęku przed odrzuceniem, unikanie powierzchowności oraz rezygnacja z ciągłego wątpienia w słuszność swojego wyboru.

W codziennym życiu jesteście parą, która kocha estetykę, romantyczne gesty i miłe spędzanie czasu. Decyzje podejmujecie pod wpływem emocji, co bywa urocze, lecz czasami destabilizuje waszą codzienność. Często szukacie potwierdzenia miłości u partnera, a waszym największym wyzwaniem są huśtawki nastrojów, zazdrość lub uzależnienie własnego poczucia wartości od nastroju drugiej osoby.

Finanse w tym archetypie wymagają uwagi, ponieważ pieniądze potrafią przeciekać wam przez palce na piękne, ale niekoniecznie potrzebne rzeczy. Obfitość materialna buduje się u was poprzez pasję i zadowolenie ze wspólnych działań. Gdy wkrada się chłód, podejrzenia lub kalkulacja pozbawiona serca, wasze zasoby kurczą się.

Związek ma największe szanse na trwałość, gdy świadomie wybieracie siebie każdego dnia, rezygnując z szukania ideałów poza relacją. Kiedy odblokujecie potencjał obfitości, wasza rzeczywistość rozkwita. Pieniądze płyną szeroko, pozwalając na życie pełne lekkości, realizację artystycznych pasji, podróże do najbardziej urokliwych zakątków świata i cieszenie się życiem bez trosk.`,

  7: `Połączyliście siły, by wspólnie wyznaczać dalekie horyzonty i odważnie dążyć do celu. Spotkaliście się, aby nauczyć się, jak zarządzać wspólną energią i przekuwać ambicje w konkretne zwycięstwa bez ścierania się o to, kto trzyma stery. Najważniejszym zadaniem jest opanowanie nawyku parcia przed siebie za wszelką cenę, wyeliminowanie agresji w działaniu i nauka dawania sobie czasu na odpoczynek.

Codzienność waszej pary jest niezwykle dynamiczna. Ciągle gdzieś jedziecie, coś planujecie, organizujecie remonty lub przeprowadzki. Decyzje zapadają szybko, a wasza skuteczność budzi podziw otoczenia. Trudnością bywa jednak nieumiejętność zatrzymania się w biegu – kiedy brakuje czasu na oddech, pojawia się drażliwość i spory o drobiazgi, a partnerzy zaczynają traktować dom jak poligon.

Finanse w tym sojuszu rosną najszybciej, gdy wspólnie ustalacie jasne, ambitne cele materialne. Pieniądze płyną do was z aktywnego działania i odwagi w podejmowaniu wyzwań. Wyzwaniem finansowym bywa chaos in wydatkach i ryzykowne inwestycje robione w pośpiechu. Blokada przepływu następuje, gdy zaczynacie rywalizować o to, kto zarabia więcej.

Warunkiem trwałości jest posiadanie wspólnego kierunku rozwoju przy jednoczesnym pozwoleniu drugiemu partnerowi na realizację jego własnych ambicji. Gdy odblokujecie swój potencjał obfitości, zyskujecie pełną wolność finansową i niesamowite tempo realizacji marzeń. Wasze życie staje się pasmem ekscytujących podróży, zakupu wymarzonych pojazdów i realizacji projektów bez ograniczeń.`,

  8: `Ta relacja to głęboki sojusz oparty na poszukiwaniu prawdy, harmonii i zrozumieniu uniwersalnych praw życiowych. Spotkaliście się, aby dostrzec związki przyczynowo-skutkowe w waszych działaniach i wypracować absolutną uczciwość we wzajemnych kontaktach. Zadaniem stojącym przed wami jest wyzwolenie się z ciągłego oceniania, krytykanctwa i szukania winnych. Lekcja polega na tym, by zrozumieć, że każdy wasz czyn ma swoje konsekwencje.

W codziennym życiu cechuje was zamiłowanie do porządku, umów i jasnych ustaleń. Decyzje podejmujecie racjonalnie, po rozważeniu wszystkich za i przeciw. Wszelkie formalności i dokumenty macie zazwyczaj perfekcyjnie uporządkowane. Wyzwaniem bywa brak emocjonalnej elastyczności i tendencja do kłótni o to, kto ma formalną rację, co może wnosić do relacji chłód.

Obszar materialny w tym związku opiera się na stabilności i legalności. Pieniądze płyną do was stabilnie, gdy dbacie o przejrzystość w interesach i rzetelnie regulujecie wszelkie zobowiązania. Wyzwaniem finansowym bywają kary lub straty wynikające z prób pójścia na skróty lub ignorowania reguł. Przepływ blokuje się, gdy pojawia się zawiść lub poczucie krzywdy.

Związek rozwija się najlepiej, gdy budujecie go na fundamencie absolutnej prawdy bez ukrywania drobnych faktów. Po odblokowaniu potencjału obfitości znika lęk przed niesprawiedliwością losu. Zyskujecie stabilny, wysoki status materialny, który daje wam spokój, możliwość realizacji wymarzonych planów i całkowite bezpieczeństwo prawne i finansowe.`,

  9: `Spotkanie partnerów pod opieką tego archetypu służy wypracowaniu głębokiej mądrości, dojrzałości i szacunku dla wewnętrznej ciszy. Przyszliście do siebie, aby nauczyć się słuchać swojego wnętrza i zbudować porozumienie duszy, które nie potrzebuje ciągłego hałasu zewnętrznego. Waszą najważniejszą lekcją jest wyjście z izolacji, zamknięcia w sobie oraz nauka dzielenia się swoimi myślami bez strachu przed niezrozumieniem.

W codziennym życiu cenicie sobie spokój, głębokie, intelektualne rozmowy i chwile spędzone sam na sam. Decyzje podejmujecie powoli, z dużą rozwagą i po dokładnym przemyśleniu wszystkich konsekwencji. Wyzwaniem w codzienności bywa chłód emocjonalny, skłonność do zamykania się w swoim świecie przy byle problemie oraz trudność z okazywaniem spontanicznej radości, co może oddalać was od siebie.

Finanse w tym układzie nie rosną z krzykliwej reklamy, lecz z głębokiej wiedzy i unikalnych umiejętności, które oboje wnosicie. Zarabiacie stabilnie, traktując pieniądze jako narzędzie do zapewnienia sobie życiowego spokoju. Wyzwaniem bywa asceza, lęk przed wydawaniem na przyjemności oraz bierność w poszukiwaniu nowych źródeł dochodu.

Wasz sojusz ma największe szanse na trwałość, jeśli dając sobie bliskość, szanujecie jednocześnie wzajemną potrzebę pobycia w samotności. Gdy odblokujecie potencjał obfitości, zyskujecie niezależność finansową, która pozwala wam żyć na własnych warunkach. Kupujecie czas dla siebie, podróżujecie do miejsc pełnych ciszy i realizujecie marzenia bez pośpiechu i na własnych zasadach.`,

  10: `To niezwykle lekka i dynamiczna relacja, w której partnerzy spotkali się, aby nauczyć się zaufania do biegu wydarzeń i puszczenia nadmiernej kontroli. Przyszliście do siebie, by odkryć, że życie to pasmo nieustannych zmian, które zawsze prowadzą we właściwym kierunku, o ile płynie się z prądem, a nie pod prąd. Waszą lekcją jest pokonanie lęku przed niestabilnością oraz rezygnacja z lenistwa i bierności w oczekiwaniu na gotowe rozwiązania.

W codziennym życiu jesteście bardzo elastyczni. Wasze plany potrafią zmienić się w ułamku sekundy, a wy zamiast się frustrować, potraficie czerpać z tego satysfakcję. Decyzje podejmujecie spontanicznie. Wyzwaniem w waszej codzienności bywa jednak chaos, brak dyscypliny i trudności z dokończeniem ważnych spraw domowych, co może rodzić okresowe poczucie zagubienia.

Sfera finansów w tym archetypie charakteryzuje się nagłymi przypływami i nieoczekiwanymi prezentami od losu. Pieniądze lubią wasz związek, gdy podchodzicie do nich bez napięcia i potraficie dzielić się nimi z radością. Wyzwaniem są finansowe dołki wynikające z braku jakichkolwiek rezerw oraz tendencja do bezmyślnego roztrwaniania środków w tłustych latach.

Największe szanse na stabilność macie wtedy, gdy akceptujecie cykle życia i nie próbujecie na siłę zamrażać rzeczywistości. Po odblokowaniu potencjału obfitości wasze życie wkracza w stan niesamowitego przepływu. Pieniądze i okazje same was znajdują, pozwalając na swobodne korzystanie z życia, beztroskie podróże na ostatnią chwilę i realizowanie najbardziej zwariowanych marzeń.`,

  11: `Wasza para połączyła się, aby nauczyć się panowania nad potężną energią życiową, pasją i fizycznym potencjałem. Spotkaliście się, aby przekonać się, że prawdziwa siła nie tkwi w agresji, krzyku czy presji, lecz w łagodności, cierpliwości i mądrym zarządzaniu własnymi zasobami. Lekcją dla was jest porzucenie chęci siłowego podporządkowania sobie partnera i unikanie pracoholizmu, który wypala waszą relację.

W codziennym życiu jesteście parą o ogromnym temperamencie. Macie mnóstwo energii na sprzątanie, budowanie, uprawianie sportu czy pracę zawodową. Wasza aktywność bywa zaraźliwa dla otoczenia. Wyzwaniem bywa jednak ciągłe napięcie – gdy jedno z was zaczyna wywierać presję na drugie lub wymagać zbyt wiele, w domu dochodzi do ostrych starć i głośnych nieporozumień.

Obszar finansowy w tej relacji budowany jest poprzez ciężką, wytrwałą i pełną pasji pracę. Potraficie zarobić bardzo duże pieniądze, bo nie boicie się zakasać rękawów. Wyzwaniem finansowym bywa jednak wycieńczenie organizmu pracą ponad siły oraz spory o to, kto wkłada w związek więcej wysiłku. Przepływ blokuje się, gdy miłość zamienia się w próbę sił.

Związek ma największe szanse na przetrwanie, gdy uczycie się rozładowywać napięcia poprzez ruch i łagodność we wzajemnym traktowaniu. Kiedy odblokujecie swój potencjał obfitości, wasza produktywność przynosi spektakularne efekty materialne. Zyskujecie niezależność finansową, która pozwala wam na luksus odpoczynku, budowanie pięknych posiadłości i realizowanie pasji bez martwienia się o koszty.`,

  12: `Spotkanie partnerów w tym archetypie służy wypracowaniu głębokiej empatii, bezwarunkowej akceptacji i zdolności patrzenia na świat z zupełnie innej, nieszablonowej perspektywy. Przyszliście do siebie, aby nauczyć się wnosić do świata miękkość, pomagać innym i budować relację opartą na głębokim zrozumieniu psychicznym. Waszą najważniejszą lekcją jest jednak wyznaczenie zdrowych granic, wyjście z roli ofiary oraz porzucenie nawyku poświęcania własnego szczęścia dla świętego spokoju.

W codziennym życiu cechuje was ogromna wrażliwość i gotowość do niesienia pomocy. Jesteście parą, do której przyjaciele i rodzina chętnie przychodzą po poradę, czując wasze ciepło i brak oceniania. Decyzje podejmujecie sercem, kierując się intuицией. Wyzwaniem w waszej codzienności bywa jednak skłonność do „zawisania” w martwym punkcie, odkładanie ważnych spraw na później oraz ryzyko emocjonalnego współuzależnienia, gdzie nastroje jednego partnera całkowicie dominują nad drugim.

Sfera materialna w tym układzie rozwija się najlepiej poprzez projekty niosące realną wartość dla ludzi – psychologię, twórczość, ekologię czy działalność pomocową. Pieniądze płyną do was, gdy potraficie docenić swoją unikalną pracę. Największym wyzwaniem finansowym jest tu jednak syndrom „wspaniałego, ale biednego” – nieumiejętność brania godnej zapłaty za swoje usługi, praca za pół darmo z litości oraz straty wynikające z dawania się wykorzystywać nieuczciwym ludziom.

Wasz związek zyskuje prawdziwą stabilność, gdy uczycie się mówić „nie” toksycznemu otoczeniu i zaczynacie dbać w pierwszej kolejności o siebie nawzajem. Po odblokowaniu potencjału obfitości znikają wasze finansowe lęki i poczucie niedocenienia. Wasze nieszablonowe pomysły zaczynają przynosić wysokie dochody, które pozwalają wam na swobodne sponsorowanie kreatywnych pasji, pomaganie innym na własnych zasadach oraz życie w komforcie, który не wymaga od was żadnych bolesnych wyrzeczeń.`,

  13: `Wasza relacja to potężny katalizator głębokich zmian i ewolucji. Spotkaliście się, aby nauczyć się bez lęku żegnać to, co stare, i wspólnie wkraczać w zupełnie nowe etapy życia. Najważniejszym zadaniem dla was jest opanowanie panicznego strachu przed zmianą i usilnego trzymania się przeszłości. Lekcja polega na tym, by przechodzić przez życiowe burze i kryzysy z wiarą, że każdy koniec przynosi narodziny czegoś lepszego.

W codziennym życiu rzadko kiedy u was wieje nudą. Wasza rzeczywistość regularnie podlega transformacji – od częstych zmian wystroju wnętrz, przez przeprowadzki, po nagłe zwroty w planach życiowych. Decyzje podejmujecie odważnie, czasami wręcz rewolucyjnie. Wyzwaniem bywa jednak brak stabilizacji i emocjonalna ostrość, która w chwilach zmęczenia może niszczyć to, co wspólnie zbudowaliście.

Obszar materialny w tym archetypie bywa pełen zwrotów akcji. Pieniądze potrafią znikać i pojawiać się w zupełnie nowy sposób, często jako rezultat zamknięcia starych, niefunkcjonujących przedsięwzięć. Wyzwaniem finansowym jest lęk przed inwestowaniem w nowe pomysły i próba kurczowego trzymania się oszczędności. Blokada puszcza, gdy śmiało wkraczacie w nieznane.

Związek rozwija się najlepiej, gdy akceptujecie nieuchronność zmian i traktujecie kryzysy jako okazje do oczyszczenia atmosfery. Kiedy odblokujecie swój potencjał obfitości, wasza elastyczność staje się waszą największą walutą. Zyskujecie niezależność finansową, która daje wam odwagę do ciągłego odkrywania nowych możliwości, bezstresowego rozpoczynania od nowa i życia pełnego pasjonujących doświadczeń.`,

  14: `Ten związek to oaza spokoju, miary i subtelnego wyczucia proporcji. Spotkaliście się, aby odnaleźć złoty środek w codzienności i nauczyć się, jak łączyć skrajności bez wywoływania wstrząsów. Waszym najważniejszym zadaniem jest wyciszenie wewnętrznej niecierpliwości, unikanie skrajnych emocjonalnych reakcji oraz nauka doceniania powolnego, naturalnego tempa wzrostu.

W codziennym życiu wasza relacja płynie powoli i harmonijnie. Cenicie sobie miękkość w komunikacji, dbałość o detale i sztukę. Podejmujecie decyzje spokojnie, dając sobie czas na analizę. Wyzwaniem w codzienności bywa jednak zbytnie wygładzanie problemów, unikanie trudnych tematów za cenę świętego spokoju oraz brak odwagi do podjęcia twardych działań, gdy sytuacja tego wymaga.

Finanse w tym archetypie rosną spokojnie i stabilnie. Nie ma tu spektakularnych, gwałtownych skoków, ale nie ma też drastycznych upadków. Pieniądze lubią waszą umiarkowaną konsumpcję i dbałość o jakość, a nie ilość. Wyzwaniem bywa zbyt duże samozadowolenie z małych kwot oraz lęk przed wejściem na wyższy poziom materialny.

Wszystko układa się doskonale, gdy dbacie o równowagę między braniem a dawaniem w relacji. Odblokowanie potencjału obfitości wnosi do waszego życia niezwykłą lekkość. Zyskujecie stabilny, wysoki poziom materialny, który pozwala wam na otaczanie się pięknem, bezstresowe planowanie przyszłości, podróże do miejsc kojących zmysły i życie w pełnej harmonii ze sobą.`,

  15: `Niezwykle magnetyczny, charyzmatyczny i intensywny sojusz. Spotkaliście się, aby odrzucić fałsz, zajrzeć pod podszewkę rzeczywistości i zmierzyć się z głębokimi materialnymi pragnieniami oraz namiętnościami. Lekcją dla was jest wyzwolenie się z wszelkich uzależnień, manipulacji, toksycznej zazdrości i prób zniewolenia partnera w jakiejkolwiek sferze. Uczycie się, jak kochać wolną wolę drugiego człowieka.

W codziennym życiu jesteście parą, która nie przechodzi niezauważona. Przyciągacie uwagę, uwielbiacie luksus i ostry humor, potraficie czerpać z życia pełnymi garściami. Decyzje podejmujecie odważnie, z dużym pragmatyzmem. Wyzwaniem bywa jednak tendencja do prowokowania konfliktów, testowania granic partnera i uleganie pokusom, co potrafi zniszczyć nawet najtrwalsze zaufanie.

Obszar finansów to wasz naturalny żywioł. Macie ogromny nos do pieniędzy, umiecie wyczuć doskonałe okazje i budować wielkie fortuny. Wyzwaniem finansowym jest jednak chciwość, ryzykanctwo oraz pokusa użycia pieniędzy jako narzędzia kontroli nad bliskimi. Obfitość płynie najszerzej, gdy wasze motywacje są całkowicie czyste i uczciwe.

Wasz związek ma największe szanse na trwałość, gdy potraficie otwarcie rozmawiać o swoich słabościach bez oceniania i dbacie o absolutną wolność partnera. Po odblokowaniu potencjału obfitości zyskujecie ogromną niezależność materialną. Wasze życie staje się pasmem niesamowitych możliwości, realizacją najskrytszych materialnych marzeń i budowaniem bezpiecznej wolności na niespotykaną skalę.`,

  16: `To dynamiczna i bardzo silna relacja, która uczy partnerów uwalniania się od iluzji i budowania życia na trwałym, nienaruszalnym fundamencie. Spotkaliście się, aby zburzyć stare, przestarzałe nawyki i przekonać się, że prawdziwego bezpieczeństwa nie dają zewnętrzne mury, lecz wewnętrzna prawda. Lekcją, którą musicie opanować, jest rezygnacja z chorobliwego uporu, agresywnego bronienia swego zdania oraz lęku przed życiową transformacją.

W codziennym funkcjonowaniu wasz związek bywa poddawany nagłym próbom. Musicie uczyć się elastyczności, bo sztywne plany rzadko kiedy u was wytrzymują zderzenie z rzeczywistością. Decyzje podejmujecie często w warunkach nagłej potrzeby działania. Wyzwaniem bywa wybuchowość i skłonność do gwałtownych reakcji, które mogą ranić drugą osobę, jeśli w porę nie opanujecie emocji.

Obszar materialny w tym archetypie wymaga budowania od zera silnych podstaw. Pieniądze przychodzą do was, gdy inwestujecie w realne, konkretne dobra (ziemia, dom, trwałe aktywa) i unikacie spekulacji. Wyzwaniem finansowym są niespodziewane wydatki wynikające z zaniedbań. Kiedy zaczynacie budować uczciwie i bez chęci pójścia na skróty, wasza obfitość staje się nienaruszalna.

Wyjątkowo dobrze funkcjonujecie, gdy wspólnie przechodzicie przez trudności, wychodząc z nich wzmocnionymi i mądrzejszymi. Po odblokowaniu potencjału obfitości uwalniacie się od lęku przed jakimkolwiek kryzysem. Zyskujecie niezachwianą wolność materialną, która pozwala wam na budowanie własnych, wymarzonych przestrzeni życiowych, spokojne podróżowanie i cieszenie się życiem w pełnym poczuciu bezpieczeństwa.`,

  17: `Wyjątkowo inspirująca, jasna i twórcza relacja. Spotkaliście się, aby odkryć swoje unikalne talenty, uwierzyć w swoje wielkie marzenia i pokazać światu swoją autentyczność. Waszym najważniejszym zadaniem jest pokonanie lęku przed byciem niewystarczająco dobrym, odrzucenie chłodu i dystansu emocjonalnego we wzajemnych kontaktach oraz nauka cierpliwości w drodze na szczyt.

W codziennym życiu jesteście parą z głową pełną planów i artystycznym zacięciem. Uwielbiacie otaczać się inspirującymi ludźmi, bywać w ciekawych miejscach i rozmawiać o przyszłości. Decyzje podejmujecie z wielkim optymizmem. Wyzwaniem bywa jednak codzienna rutyna i proza życia – kiedy pojawiają się rachunki i obowiązki domowe, możecie odczuwać rozczarowanie, że rzeczywistość nie pasuje do waszego pięknego obrazka.

Finanse w tym sojuszu rozwijają się najlepiej, gdy wasze wspólne działania niosą unikalną wartość dla innych i są robione z pasją. Pieniądze przychodzą jako naturalny skutek waszego rozkwitu i uznania waszego wkładu przez otoczenie. Wyzwaniem bywa brak realizmu w kalkulacjach oraz skłonność do wydawania na pozory i status.

Najlepsze warunki do rozwoju macie wtedy, gdy jesteście dla siebie nawzajem najpotężniejszym źródłem wsparcia i nie rywalizujecie o blask jupiterów. Gdy odblokujecie potencjał obfitości, wasza rzeczywistość staje się bajecznie kolorowa. Wolność finansowa pozwala wam na bezstresowe podróże, finansowanie najbardziej nieszablonowych pomysłów i życie pełne twórczej dumy.`,

  18: `To relacja o niezwykłej sile przyciągania, pełna intuicji i tajemnicy. Spotkaliście się, aby nauczyć się materializacji swoich najgłębszych pragnień oraz zmierzyć się z nieświadomymi lękami, które potrafią blokować wasze działania. Lekcją dla was jest wyzwolenie się z czarnowidztwa, oszustw, iluzji oraz tendencji do uciekania od rzeczywistości w nierealne światy lub złe nawyki.

Codzienność waszego związku jest mocno spleciona z waszymi nastrojami. Wyczuwacie siebie nawzajem na odległość i potraficie niemal czytać w swoich myślach. Podejmujecie decyzje wyczuciem, co często prowadzi was do świetnych rezultatów. Wyzwaniem bywa jednak uleganie stanom smutku, tworzenie w głowie czarnych scenariuszy i kłótnie oparte na urojonych podejrzeniach, co wnosi do domu niepotrzebny niepokój.

Obszar materialny w tym archetypie zależy bezpośrednio od waszego nastawienia. Macie niesamowity dar przyciągania bogactwa samą siłą waszych wspólnych intencji i wizualizacji. Wyzwaniem finansowym bywają nagłe straty wynikające z lęku przed biedą lub pakowanie się w mgliste, niejasne interesy. Gdy wasze intencje są czyste i jasne, pieniądze płyną rzeką.

Związek ma największe szanse na trwałość, gdy panuje między wami absolutna szczerość, a wasz dom jest bezpieczną, spokojną przystanią wolną od niedomówień. Odblokowanie potencjału obfitości sprawia, że wasze marzenia materializują się w zadziwiający sposób. Zyskujecie niezależność finansową, która daje wam pełną swobodę w tworzeniu idealnego otoczenia, pasjonujących podróżach i cieszeniu się życiem pełnym magii.`,

  19: `To jedna z najjaśniejszych, najbardziej optymistycznych i pełnych radości relacji. Spotkaliście się, aby wspólnie świecić najjaśniejszym światłem, dzielić się swoim szczęściem z otoczeniem i budować obfite, wielobarwne życie. Waszą kluczową lekcją jest rezygnacja z egoizmu, chęci bezustannej uwagi wyłącznie dla siebie oraz unikanie wypalania partnera swoimi wygórowanymi wymaganiami czy zazdrością.

W codziennym życiu zarażacie innych dobrą energią. Wasz dom jest pełen śmiechu, gości, dzieci lub wspólnych, radosnych planów. Decyzje podejmujecie z rozmachem i wielką wiarą w sukces. Wyzwaniem bywa czasami zbyt duża intensywność – kiedy wasze wewnętrzne słońce zaczyna palić zamiast grzać, w relacji pojawia się duma, obrażanie się za błahe sprawy i niepotrzebne dramaty o dominację.

Sfera finansów w tym związku układa się wspaniale. Cechuje was ogromna szczodrość i rozmach w generowaniu dochodów. Pieniądze płyną do was szerokim strumieniem, bo potraficie cieszyć się nimi i dzielić z innymi. Wyzwaniem finansowym bywa nadmierna rozrzutność i chęć zaimponowania innym kosztownym stylem życia ponad stan.

Związek rozwija się najpiękniej, gdy wspólnie tworzycie ciepłą atmosferę akceptacji i potraficie cieszyć się z małych spraw, nie tracąc z oczu wielkich celów. Po odblokowaniu potencjału obfitości wasze życie wkracza w fazę absolutnego dobrobytu. Wolność finansowa daje wam możliwość swobodnego podróżowania, realizacji śmiałych, radosnych marzeń i bezstresowego pomagania bliskim.`,

  20: `Silna, dojrzała relacja o głębokich korzeniach, która uczy partnerów szacunku do rodowych wartości i budowania trwartej tożsamości. Spotkaliście się, by wspólnie wyjść poza stare, ograniczające schematy waszych rodzin początkowych i stworzyć nowy, mądry model relacji na pokolenia. Lekcją dla was jest odrzucenie wiecznych pretensji do rodziców, unikanie chęci zmieniania partnera na siłę oraz nauka przebaczania.

W codziennym życiu jesteście bardzo związani z tradycją, domem i rodziną. Decyzje podejmujecie z myślą o spójności waszego klanu i przyszłości dzieci. Wyzwaniem w codzienności bywa jednak nadmierne uleganie opiniom krewnych, ciągłe wracanie do dawnych, dawno rozwiązanych sporów oraz skłonność do narzucania sztywnych reguł, co potrafi zablokować świeżość w waszej relacji.

Obszar materialny w tym archetypie jest ściśle związany z budowaniem trwałego majątku (nieruchomości, ziemia, rodzinne firmy). Pieniądze płyną stabilnie, gdy wasze działania są uczciwe wobec waszego otoczenia i wspieracie bliskich. Wyzwaniem bywają spory o spadki lub próby finansowania dorosłych dzieci kosztem własnej stabilności.

Wasz sojusz rozkwita najbardziej, gdy potraficie postawić zdrowe granice wpływom z zewnątrz i wspólnie budujecie własne tradycje. Po odblokowaniu potencjału obfitości wasz status materialny staje się całkowicie bezpieczny i niezależny. Cieszycie się życiem, podróżując wielopokoleniowo, inwestując w rodzinne gniazda i realizując marzenia w pełnym poczuciu stabilności.`,

  21: `To wyjątkowo szeroka, tolerancyjna i pełna wolności relacja, która nie zna barier ani ograniczeń. Spotkaliście się, aby wspólnie poszerzać swoje horyzonty, poznawać nowe kultury i przekonać się, że cały świat może być waszym domem. Waszym najważniejszym zadaniem jest pokonanie lęku przed nieznanym, wyjście z ciasnych poglądów oraz unikanie krytykowania wszystkiego, co inne i nietypowe.

Codzienność waszego związku charakteryzuje się ogromną otwartością. Jeśli podejmujecie decyzje, to zawsze z myślą o skali globalnej. Uwielbiacie podróże, obcojęzycznych znajomych, nowoczesne technologie i ekologię. Wyzwaniem bywa jednak brak stabilizacji i 'rozpływanie się' w zbyt wielu odległych celach naraz, co utrudnia uziemienie waszych konkretnych, codziennych spraw.

Sfera finansów w tej relacji nie toleruje ograniczeń. Pieniądze przychodzą do was najszerszym strumieniem z nowoczesnych, międzynarodowych projektów lub z pracy opartej na nowoczesnych mediach. Wyzwaniem bywa lęk przed pójściem na szerokie wody oraz nieumiejętność oszczędzania w obliczu chęci ciągłego próbowania nowych rzeczy.

Związek ma największe szanse na trwałość i rozwój, gdy dajecie sobie nawzajem absolutną wolność osobistą bez chęci ograniczania partnera. Kiedy odblokujecie potencjał obfitości, zyskujecie całkowitą globalną swobodę. Wasze życie to nieustająca podróż, możecie bez problemu mieszkać w różnych zakątkach świata, realizować kosmiczne marzenia i cieszyć się urokami życia bez barier.`,

  22: `Niezwykle lekka, radosna i pełna wolności relacja, która uczy partnerów życia chwilą obecną i zaczynania wszystkiego z lekkim sercem. Spotkaliście się, aby uwolnić się od sztywnych ram, nadmiernego materializmu i przekonać się, że najlepsze przygody spotykają tych, którzy idą przez świat bez zbędnego bagażu. Lekcją stojącą przed wami jest wypracowanie odpowiedzialności za swoje słowa i działania oraz rezygnacja z niedojrzałości, która destabilizuje codzienne życie.

W codziennym funkcjonowaniu jesteście parą pełną humoru, spontaniczności i dystansu do problemów. Decyzje podejmujecie pod wpływem chwili, co daje wam wiele radości, ale bywa trudne dla otoczenia. Waszym wyzwaniem jest chroniczny brak planowania, lekkomyślność oraz trudności w budowaniu trwałych nawyków domowych, co czasem prowadzi do niepotrzebnego kryzysu organizacji.

Obszar materialny w tym sojuszu wymaga od was nauki mądrego zarządzania środkami. Pieniądze przychodzą do was łatwo, gdy traktujecie je bez fanatyzmu i strachu. Jednak wyzwaniem bywają pustki w portfelu wynikające z całkowitej beztroski finansowej i wydawania wszystkiego, co macie, bez myśli o jutrze. Blokada obfitości znika, gdy łączycie swobodę z minimalną dyscypliną.

Relacja rozwija się najpiękniej, gdy akceptujecie swoją potrzebę wolności przy zachowaniu wzajemnego szacunku dla codziennego bezpieczeństwa. Po odblokowaniu potencjału obfitości wasze życie nabiera niespotykanej lekkości. Zyskujecie niezależność finansową, która pozwala wam podróżować z jednym plecakiem po całym świecie, realizować spontaniczne marzenia w ułamku sekundy i cieszyć się życiem bez jakichkolwiek ograniczeń.`
};

