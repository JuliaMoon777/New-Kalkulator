import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Calendar, Activity, ScrollText, 
  Heart, Wallet, Star, Shield, 
  ChevronRight, RefreshCw, User, Users,
  Heart as HeartIcon, DollarSign, Sparkles, Brain, 
  Gem, Map, Gift, Compass, Instagram, Facebook, Youtube
} from 'lucide-react';
import { calculateMatrix, calculateCompatibility, calculateAge, reduceTo22, type MatrixData, ARCANA_GUIDE, ARCANA_NAMES, STATIC_MONTH_INTERPRETATIONS, STATIC_RELATIONSHIP_INTERPRETATIONS } from './utils/matrixUtils';

const MONTH_NAMES_PL: Record<number, string> = {
  1: 'Styczeń',
  2: 'Luty',
  3: 'Marzec',
  4: 'Kwiecień',
  5: 'Maj',
  6: 'Czerwiec',
  7: 'Lipiec',
  8: 'Sierpień',
  9: 'Wrzesień',
  10: 'Październik',
  11: 'Listopad',
  12: 'Grudzień',
};

function getMonthNamePl(dob: string): string {
  if (!dob || dob.length < 10) return 'Nieznany miesiąc';
  const parts = dob.split('.');
  if (parts.length < 2) return 'Nieznany miesiąc';
  const monthNum = parseInt(parts[1], 10);
  return MONTH_NAMES_PL[monthNum] || 'Nieznany miesiąc';
}

export default function App() {
  const [person1, setPerson1] = useState({ dob: '', name: '' });
  const [person2, setPerson2] = useState({ dob: '', name: '' });
  const [mode, setMode] = useState<'single' | 'compatibility'>('single');
  const [view, setView] = useState<'p1' | 'p2' | 'common'>('p1');
  const [result, setResult] = useState<{ m1?: MatrixData; m2?: MatrixData; common?: MatrixData }>({});

  const [aiInterpretations, setAiInterpretations] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem('matryca_ai_talents');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [relInterpretations, setRelInterpretations] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem('matryca_ai_relationship');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [relLoading, setRelLoading] = useState(false);
  const [relError, setRelError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('matryca_ai_talents', JSON.stringify(aiInterpretations));
    } catch (e) {
      console.error('LocalStorage caching failed:', e);
    }
  }, [aiInterpretations]);

  useEffect(() => {
    try {
      localStorage.setItem('matryca_ai_relationship', JSON.stringify(relInterpretations));
    } catch (e) {
      console.error('LocalStorage caching failed for relationship:', e);
    }
  }, [relInterpretations]);

  const generateInterpretation = async (dob: string, bValue: number, bName: string) => {
    const monthName = getMonthNamePl(dob);
    const cacheKey = `${dob}_${bValue}`;
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/interpret-talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthName,
          arcanNum: bValue,
          arcanName: bName,
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generowanie nie powiodło się.');
      }
      
      const data = await response.json();
      setAiInterpretations((prev) => ({
        ...prev,
        [cacheKey]: data.result,
      }));
    } catch (err: any) {
      setAiError(err.message || 'Brak połączenia z doradcą AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateRelationshipInterpretation = async (arcanNum: number, arcanName: string, cacheKey: string) => {
    setRelLoading(true);
    setRelError(null);
    try {
      const response = await fetch('/api/interpret-relationship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arcanNum,
          arcanName,
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generowanie analizy nie powiodło się.');
      }
      
      const data = await response.json();
      setRelInterpretations((prev) => ({
        ...prev,
        [cacheKey]: data.result,
      }));
    } catch (err: any) {
      setRelError(err.message || 'Brak połączenia z ekspertem relacji AI.');
    } finally {
      setRelLoading(false);
    }
  };

  const age1 = calculateAge(person1.dob);
  const age2 = calculateAge(person2.dob);

  const calculate = () => {
    const res: any = {};
    if (person1.dob.length === 10) res.m1 = calculateMatrix(person1.dob);
    if (person2.dob.length === 10) res.m2 = calculateMatrix(person2.dob);
    
    if (res.m1 && res.m2 && mode === 'compatibility') {
      res.common = calculateCompatibility(res.m1, res.m2);
    }
    setResult(res);
  };

  useEffect(() => {
    calculate();
  }, [person1.dob, person2.dob, mode]);



  const activeMatrix = mode === 'single' ? result.m1 : (view === 'p1' ? result.m1 : view === 'p2' ? result.m2 : result.common);

  const activeDob = mode === 'single' ? person1.dob : (view === 'p1' ? person1.dob : person2.dob);
  const activeMonthName = getMonthNamePl(activeDob);
  const cacheKey = activeMatrix ? `${activeDob}_${activeMatrix.B}` : '';

  const handleDateChange = (val: string, setter: any) => {
    let cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4);
    }
    
    setter((prev: any) => ({ ...prev, dob: formatted }));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      {/* Subtle top blur decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-[10%] right-[-1%] w-[25%] h-[25%] bg-orange-100/40 rounded-full blur-[90px]" />
      </div>

      <div className="max-w-[1300px] mx-auto px-4 pt-10 md:pt-16 relative z-10" id="main-container">
        
        {/* Top Header */}
        <div className="flex flex-col items-center mb-10 text-center" id="header-section">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
             <div className="w-16 h-16 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                <img src="https://i.postimg.cc/wvF033Vy/Logo-no-JM.png" alt="Logo" className="w-full h-full object-contain pointer-events-none" />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 uppercase font-sans">
                  Kalkulator <span className="text-[#a855f7]">Matrycy Losu</span>
                </h1>
             </div>
          </motion.div>

          {/* Individual vs Compatibility Tabs */}
          <div className="relative bg-white p-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-8 flex items-center border border-slate-100/80" id="tab-mode-selector">
            <button 
              onClick={() => { setMode('single'); setView('p1'); }}
              className={`relative z-10 px-8 py-3 rounded-full text-[11px] font-bold tracking-widest transition-all ${mode === 'single' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              id="btn-individual"
            >
              INDYWIDUALNA
            </button>
            <button 
              onClick={() => setMode('compatibility')}
              className={`relative z-10 px-8 py-3 rounded-full text-[11px] font-bold tracking-widest transition-all ${mode === 'compatibility' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              id="btn-compatibility"
            >
              ZGODNOŚĆ
            </button>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl px-2" id="inputs-wrapper">
            {/* Person 1 Input */}
            <div className="flex-1 min-w-[280px]">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                  {mode === 'compatibility' && (
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      OSOBA 1
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <User className="w-4 h-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Imię (opcjonalnie)</p>
                          <input 
                             value={person1.name}
                             onChange={(e) => setPerson1(p => ({ ...p, name: e.target.value }))}
                             placeholder="Wpisz imię..."
                             className="bg-transparent border-none focus:ring-0 font-bold text-sm text-slate-700 w-full p-0 leading-tight focus:outline-none"
                             id="input-name-1"
                          />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-[#faf5ff] p-3 rounded-2xl border border-[#f3e8ff]">
                        <Calendar className="w-4 h-4 text-[#a855f7]" />
                        <div className="flex-1">
                          <p className="text-[8px] font-bold text-[#a855f7] uppercase">Data urodzenia</p>
                          <input 
                             value={person1.dob}
                             onChange={(e) => handleDateChange(e.target.value, setPerson1)}
                             placeholder="DD.MM.RRRR"
                             className="bg-transparent border-none focus:ring-0 font-black text-base text-slate-800 w-full p-0 leading-tight focus:outline-none"
                             id="input-dob-1"
                          />
                        </div>
                     </div>
                  </div>
              </div>
            </div>

            {/* Person 2 Input in Compatibility Mode */}
            {mode === 'compatibility' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 min-w-[280px]"
                id="person2-wrapper"
              >
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">OSOBA 2</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                          <User className="w-4 h-4 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Imię (opcjonalnie)</p>
                            <input 
                               value={person2.name}
                               onChange={(e) => setPerson2(p => ({ ...p, name: e.target.value }))}
                               placeholder="Wpisz imię..."
                               className="bg-transparent border-none focus:ring-0 font-bold text-sm text-slate-700 w-full p-0 leading-tight focus:outline-none"
                               id="input-name-2"
                            />
                          </div>
                       </div>
                       <div className="flex items-center gap-3 bg-[#fff7ed] p-3 rounded-2xl border border-[#ffedd5]">
                          <Calendar className="w-4 h-4 text-[#f97316]" />
                          <div className="flex-1">
                            <p className="text-[8px] font-bold text-[#f97316] uppercase">Data urodzenia</p>
                            <input 
                               value={person2.dob}
                               onChange={(e) => handleDateChange(e.target.value, setPerson2)}
                               placeholder="DD.MM.RRRR"
                               className="bg-transparent border-none focus:ring-0 font-black text-base text-slate-800 w-full p-0 leading-tight focus:outline-none"
                               id="input-dob-2"
                            />
                          </div>
                       </div>
                    </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content Tabs for Compatibility View Options */}
        {mode === 'compatibility' && (
          <div className="flex justify-center mb-8 gap-2 px-4" id="compatibility-subtabs">
            {[
              { id: 'p1', label: person1.name || 'Osoba 1' },
              { id: 'common', label: 'ZGODNOŚĆ' },
              { id: 'p2', label: person2.name || 'Osoba 2' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  view === tab.id 
                    ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-md' 
                    : 'bg-white text-slate-400 border-slate-200/60 hover:bg-slate-50'
                }`}
                id={`subtab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content: Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12" id="main-content-grid">
          
          {/* LEFT: Matrix Graphical Circle Canvas */}
          <div className="lg:col-span-7 flex flex-col items-center" id="diagram-column">
            <AnimatePresence mode="wait">
              {activeMatrix ? (
                <motion.div 
                  key={mode + (person1.dob) + (person2.dob) + view}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex justify-center"
                >
                  {/* Styled Outer Diamond Circle with gorgeous white background and soft card styling */}
                  <div className="w-full max-w-[500px] aspect-square relative bg-white rounded-full p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] border border-slate-100/50 flex items-center justify-center" id="white-circle-canvas">
                    <MatrixSvg data={activeMatrix} />
                  </div>
                </motion.div>
              ) : (
                <div className="w-full max-w-[500px] aspect-square bg-white rounded-full flex items-center justify-center border border-slate-100 text-slate-450 italic text-sm">
                  Wprowadź prawidłową datę urodzenia...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Modernized beautiful Health Card Table */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-10" id="health-card-column">
            <AnimatePresence mode="wait">
              {activeMatrix && view !== 'common' ? (
                <motion.div
                  key={mode + (person1.dob) + (person2.dob) + view}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-[2rem] p-8 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)]"
                  id="health-card-container"
                >
                  <div className="text-center mb-8">
                     <h2 className="text-lg font-black text-slate-800 uppercase tracking-[0.24em] font-sans">KARTA ZDROWIA</h2>
                     {mode === 'compatibility' && (
                        <span className="text-[9px] font-black tracking-widest text-[#a855f7] uppercase block mt-1">Połączona energia zdrowia</span>
                     )}
                  </div>
                  
                  <HealthTable chakras={activeMatrix.chakras} />
                </motion.div>
              ) : activeMatrix && view === 'common' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-[#d4af37] text-stone-800 shadow-[0_20px_60px_rgba(212,175,55,0.06)] rounded-[2rem] p-8 flex flex-col justify-between"
                  id="compatibility-info-card"
                >
                  <div>
                    <h2 className="text-xs font-black text-amber-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-700" /> ANALIZA ZWIĄZKU
                    </h2>
                    
                    {/* Archetype Indicator Badge */}
                    <div className="flex items-center gap-3 bg-amber-500/5 border border-[#d4af37]/30 p-3 rounded-2xl mb-6 shadow-sm">
                      <span className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-950 font-black flex items-center justify-center border border-[#d4af37]/50 font-mono text-lg shrink-0">
                        {activeMatrix.A}
                      </span>
                      <div className="text-left">
                        <p className="text-[8px] font-bold text-amber-900/60 uppercase tracking-widest">Archetyp inicjujący relację</p>
                        <p className="text-xs font-black text-amber-950 leading-tight mt-0.5">
                          {ARCANA_NAMES[activeMatrix.A] || ''}
                        </p>
                      </div>
                    </div>

                    {/* Interpretation Text Flow */}
                    <div className="relative min-h-[140px] text-justify">
                      {STATIC_RELATIONSHIP_INTERPRETATIONS[activeMatrix.A] ? (
                        <div className="text-xs text-stone-850 leading-relaxed transition-opacity duration-300">
                          {STATIC_RELATIONSHIP_INTERPRETATIONS[activeMatrix.A].split('\n').filter(p => p.trim().length > 0).map((paragraph, idx) => (
                            <p key={idx} className="mb-4 last:mb-0 leading-relaxed text-justify text-[12px] font-medium text-stone-800">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-stone-500 italic text-center py-6">
                          Materiały dla tego archetypu są chwilowo niedostępne.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM SECTION: WIEK, FATE CARDS, ANCESTRAL POWER & STRENGTH */}
        <AnimatePresence mode="wait">
          {activeMatrix && (
            <motion.div
              key={`bottom-${mode}-${view}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 md:space-y-8"
              id="bottom-section-wrapper"
            >
              {/* Divider and Title */}
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-[#f1f5f9] px-6 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
                  WIEK & KODY MOCY & PRZEZNACZENIA
                </div>
              </div>

              {/* WIEK Container */}
              <div className="flex justify-center" id="widget-wiek-container">
                <div className="bg-white rounded-2xl px-8 py-4 border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.02)] flex items-center gap-5">
                   <div className="flex flex-col text-left">
                     <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">WIEK</span>
                   </div>
                   <span className="text-3xl font-black text-[#1e293b]" id="text-wiek-value">
                     {mode === 'single' ? (age1 || '-') : (view === 'p1' ? (age1 || '-') : view === 'p2' ? (age2 || '-') : `${age1} i ${age2}`)}
                   </span>
                </div>
              </div>

              {/* The Four Cards (Znalezienie siebie, Socjalizacja, Przeznaczenie duchowe, Korzyść) */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${view === 'common' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`} id="fate-cards-grid">
                
                {/* Card 1: Znalezienie siebie */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between" id="card-stage-1">
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">1 pr-e</p>
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5">
                       {view === 'common' ? 'FUNDAMENT RELACJI' : 'ZNALEZIENIE SIEBIE'}
                     </p>
                     
                     <div className="mt-4 flex gap-4 text-[11px] text-slate-450 border-t border-slate-50 pt-3">
                        <div>
                          <span className="font-bold text-slate-400">Niebo:</span> <span className="font-black text-slate-750">{activeMatrix.sky}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400">Ziemia:</span> <span className="font-black text-slate-750">{activeMatrix.earth}</span>
                        </div>
                     </div>

                     {view === 'common' && (
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed text-justify border-t border-slate-100 pt-3 font-medium">
                          To fundament, na którym opierają się wasze uczucia i codzienność. Tutaj dochodzi do subtelnego nastrojenia dwóch światów: Niebo (strefa duchowa) odpowiada za wspólne wartości, więź emocjonalną i to, jak partnerzy wyczuwają siebie nawzajem, a Ziemia (strefa materialna) – za to, jak układa się wspólne życie, jak rozwiązywane są kwestie codzienne i jak uziemiane są uczucia.
                        </p>
                     )}
                   </div>
                   
                   <div className="flex justify-end mt-6">
                      <div className="w-12 h-12 rounded-full bg-[#faf5ff] text-[#a855f7] border-2 border-[#f3e8ff] flex items-center justify-center font-extrabold text-base shadow-sm font-mono">
                        {activeMatrix.personal}
                      </div>
                   </div>
                </div>

                {/* Card 2: Socjalizacja */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between" id="card-stage-2">
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">2 pr-e</p>
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5">
                       {view === 'common' ? 'PRODUKTYWNOŚĆ PARY I POSZERZANIE OBFITOŚCI' : 'SOCJALIZACJA'}
                     </p>
                     
                     <div className="mt-4 flex gap-4 text-[11px] text-slate-450 border-t border-slate-50 pt-3">
                        <div>
                          <span className="font-bold text-slate-400">Męska:</span> <span className="font-black text-slate-750">{activeMatrix.male}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400">Żeńska:</span> <span className="font-black text-slate-750">{activeMatrix.female}</span>
                        </div>
                     </div>

                     {view === 'common' && (
                        <div className="text-xs text-slate-500 mt-4 space-y-3 text-justify border-t border-slate-100 pt-3">
                           <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                             <span className="font-black text-slate-700 uppercase text-[9px] tracking-wider block mb-0.5">Mężczyzna</span>
                             <p className="leading-relaxed text-slate-500 font-medium">
                               Kumuluje w sobie wszystkie zadania, siłę i ukryte talenty mężczyzny, które odkrywa on i wnosi do tego związku.
                             </p>
                           </div>
                           <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                             <span className="font-black text-slate-700 uppercase text-[9px] tracking-wider block mb-0.5">Kobieta</span>
                             <p className="leading-relaxed text-slate-500 font-medium">
                               Uosabia mądrość, talenty i zadania kobiety, którymi karmi ona ten sojusz.
                             </p>
                           </div>
                           <p className="leading-relaxed border-t border-slate-100 pt-3 italic text-slate-450 font-medium">
                             Kiedy te energie łączą się prawidłowo, nie tylko się sumują, ale wręcz mnożą. Ma to bezpośredni wpływ na to, jak partnerzy przejawiają się względem siebie (inspirują, wspierają, dzielą się zasobami) oraz jak funkcjonują w społeczeństwie. Poprzez uznanie pary przez otoczenie uruchawia się proces poszerzania obfitości – zarówno tej materialnej (dochód, projekty, status), jak i duchowej.
                           </p>
                        </div>
                     )}
                   </div>
                   
                   <div className="flex justify-end mt-6">
                      <div className="w-12 h-12 rounded-full bg-[#faf5ff] text-[#a855f7] border-2 border-[#f3e8ff] flex items-center justify-center font-extrabold text-base shadow-sm font-mono">
                        {activeMatrix.social}
                      </div>
                   </div>
                </div>

                {/* Card 3: Przeznaczenie duchowe */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between" id="card-stage-3">
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">3 pr-e</p>
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5 leading-tight">
                       {view === 'common' ? 'WYŻSZY SENS ZWIĄZKU' : 'PRZEZNACZENIE DUCHOWE'}
                     </p>
                     
                     {view !== 'common' ? (
                       <p className="text-[10px] text-slate-400 mt-2 italic">Podsumowująca wibracja sfery ducha</p>
                     ) : (
                       <p className="text-xs text-slate-500 mt-4 leading-relaxed text-justify border-t border-slate-100 pt-3 font-medium">
                         Pokazuje sakralny punkt ewolucji związku, do którego partnerzy zbliżają się każdego dnia – pokonując kryzysy, ciesząc się sukcesami i transformując egoizm we współtworzenie. To to głębokie, bezwarunkowe duchowe zrozumienie, do którego partnerzy mają dojść poprzez tę relację.
                       </p>
                     )}
                   </div>
                   
                   <div className="flex justify-end mt-6">
                      <div className="w-12 h-12 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-extrabold text-base shadow-md font-mono">
                        {activeMatrix.spiritual}
                      </div>
                   </div>
                </div>

                {/* Card 4: planetarne */}
                {view !== 'common' && (
                <div className="bg-[#1e293b] text-white rounded-[2rem] p-6 shadow-lg flex flex-col justify-between relative overflow-hidden" id="card-stage-korzysc">
                   {/* Background circular highlight to pop visually */}
                   <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
                   
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">4 pr-e</p>
                     <p className="text-sm font-black text-[#faf5ff] uppercase mt-0.5 leading-tight">planetarne</p>
                     <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                       Wskazuje, jakich zasad należy przestrzegać, zwracając się do dużej liczby ludzi.
                       Pokazuje, poprzez jaką energię człowiek może wpływać na dużą liczbę osób w skali swojego zespołu pracowniczego, organizacji, w której pracuje, a nawet kraju, w którym żyje.
                     </p>
                   </div>
                   
                   <div className="flex justify-end mt-6 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-white text-[#1e293b] flex items-center justify-center font-extrabold text-base shadow-md font-mono">
                        {activeMatrix.planetary}
                      </div>
                   </div>
                </div>
                )}
              </div>

              {/* Minimalist Cards for Ancestral strength and Power code display */}
              {view !== 'common' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="additional-blocks-row">
                 
                 {/* Siła przodkówCard */}
                 <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_12px_30px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.035)]" id="card-additional-ancestral">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400/15 via-yellow-400/10 to-amber-500/15 border border-amber-200/30 flex items-center justify-center text-amber-500 shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.08)] overflow-hidden">
                          <motion.svg width="38" height="38" viewBox="0 0 40 40" fill="none" className="text-amber-500">
                             <motion.g 
                               animate={{ rotate: 360 }} 
                               transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
                               style={{ transformOrigin: '20px 20px' }}
                             >
                                {/* Seme życia (Seed of Life) with 7 interlocking circles */}
                                <circle cx="20" cy="20" r="7.5" stroke="currentColor" strokeWidth="0.8" />
                                <circle cx="20" cy="12.5" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                <circle cx="26.49" cy="16.25" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                <circle cx="26.49" cy="23.75" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                <circle cx="20" cy="27.5" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                <circle cx="13.51" cy="23.75" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                <circle cx="13.51" cy="16.25" r="7.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.9" />
                                
                                {/* Outer boundary rings */}
                                <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                                <circle cx="20" cy="20" r="15.6" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.3" />
                                
                                <motion.circle 
                                  cx="20" cy="20" r="1.5" 
                                  fill="currentColor" 
                                  animate={{ scale: [0.8, 1.3, 0.8] }} 
                                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                                />
                             </motion.g>
                          </motion.svg>
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Moc przodków</p>
                          <p className="text-xs text-slate-400 mt-0.5">Potencjał rodów męskich i żeńskich</p>
                       </div>
                    </div>
                    <span className="text-2xl font-black text-[#1e293b] font-mono px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {activeMatrix.ancestralStrength}
                    </span>
                 </div>

                 {/* Wewnętrzny kod siły Card */}
                 <div className="bg-white rounded-[2rem] p-6 border border-slate-100/80 shadow-[0_12px_30px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.035)]" id="card-additional-powercode">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400/15 via-yellow-400/10 to-amber-500/15 border border-amber-200/30 flex items-center justify-center text-amber-500 shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.08)] overflow-hidden">
                          <motion.svg width="38" height="38" viewBox="0 0 40 40" fill="none" className="text-amber-500">
                             <motion.g 
                               animate={{ rotate: -360 }} 
                               transition={{ repeat: Infinity, duration: 30, ease: "linear" }} 
                               style={{ transformOrigin: '20px 20px' }}
                             >
                                {/* Zarodek życia (Germ / Egg of Life) multi-overlapping cell system */}
                                <circle cx="20" cy="20" r="5.5" stroke="currentColor" strokeWidth="0.8" />
                                <circle cx="20" cy="14.5" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                <circle cx="24.76" cy="17.25" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                <circle cx="24.76" cy="22.75" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                <circle cx="20" cy="25.5" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                <circle cx="15.24" cy="22.75" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                <circle cx="15.24" cy="17.25" r="5.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
                                
                                {/* Outer containment and balance lines */}
                                <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 2" strokeOpacity="0.5" />
                                <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 2" strokeOpacity="0.3" />
                                <motion.circle 
                                  cx="20" cy="20" r="1.8" 
                                  fill="currentColor" 
                                  animate={{ scale: [0.8, 1.35, 0.8], opacity: [0.8, 1, 0.8] }} 
                                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} 
                                />
                             </motion.g>
                          </motion.svg>
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Wewnętrzny kod mocy</p>
                          <p className="text-xs text-slate-400 mt-0.5">Twoje unikalne spektrum mocy</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 font-mono">
                       <span className="text-sm font-black text-[#a855f7] bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                         {activeMatrix.E}
                       </span>
                       <span className="text-[10px] font-bold text-slate-350">•</span>
                       <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                         {activeMatrix.internalPower}
                       </span>
                       <span className="text-[10px] font-bold text-slate-350">•</span>
                       <span className="text-sm font-black text-amber-750 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                         {reduceTo22(activeMatrix.E + activeMatrix.internalPower)}
                       </span>
                     </div>
                  </div>
               </div>
               )}

               {/* Interpretation Blocks (Darmic/Life Guides) */}
              {view !== 'common' && activeMatrix && (
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] mt-10" id="month-talent-interpretation-container">
                    <div className="bg-gradient-to-br from-amber-50/45 via-yellow-50/15 to-slate-50/10 rounded-2xl p-6 md:p-8 border border-amber-100/45 relative overflow-hidden text-left">
                      {/* background glow effect */}
                      <div className="absolute right-0 top-0 w-48 h-48 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400/15 via-yellow-400/10 to-amber-500/15 border border-amber-200/20 flex items-center justify-center text-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.06)] overflow-hidden">
                             <motion.svg width="38" height="38" viewBox="0 0 40 40" fill="none" className="text-amber-500">
                                <motion.g 
                                  animate={{ rotate: 360 }} 
                                  transition={{ repeat: Infinity, duration: 45, ease: "linear" }} 
                                  style={{ transformOrigin: '20px 20px' }}
                                >
                                   {/* Plod życia (Fruit of Life) metatron blueprint network */}
                                   <line x1="32.8" y1="20" x2="26.4" y2="31.08" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   <line x1="26.4" y1="31.08" x2="13.6" y2="31.08" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   <line x1="13.6" y1="31.08" x2="7.2" y2="20" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   <line x1="7.2" y1="20" x2="13.6" y2="8.92" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   <line x1="13.6" y1="8.92" x2="26.4" y2="8.92" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   <line x1="26.4" y1="8.92" x2="32.8" y2="20" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.2" />
                                   
                                   <line x1="20" y1="20" x2="32.8" y2="20" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />
                                   <line x1="20" y1="20" x2="26.4" y2="31.08" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />
                                   <line x1="20" y1="20" x2="13.6" y2="31.08" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />
                                   <line x1="20" y1="20" x2="7.2" y2="20" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />
                                   <line x1="20" y1="20" x2="13.6" y2="8.92" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />
                                   <line x1="20" y1="20" x2="26.4" y2="8.92" stroke="currentColor" strokeWidth="0.35" strokeOpacity="0.25" />

                                   {/* Central circle */}
                                   <circle cx="20" cy="20" r="3.2" stroke="currentColor" strokeWidth="0.75" />
                                   {/* 12 surrounding circles on 6 axes */}
                                   <circle cx="26.4" cy="20" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="32.8" cy="20" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   
                                   <circle cx="23.2" cy="25.54" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="26.4" cy="31.08" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   
                                   <circle cx="16.8" cy="25.54" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="13.6" cy="31.08" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   
                                   <circle cx="13.6" cy="20" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="7.2" cy="20" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   
                                   <circle cx="16.8" cy="14.46" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="13.6" cy="8.92" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   
                                   <circle cx="23.2" cy="14.46" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />
                                   <circle cx="26.4" cy="8.92" r="3.2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.95" />

                                   <motion.circle 
                                     cx="20" cy="20" r="1.2" 
                                     fill="currentColor" 
                                     animate={{ scale: [0.8, 1.4, 0.8] }} 
                                     transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} 
                                   />
                                </motion.g>
                             </motion.svg>
                          </div>
                          <div>
                            <span className="text-lg font-black tracking-tight text-slate-800 uppercase font-sans">
                              GŁÓWNY TALENT DUSZY
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-amber-100/40 shadow-sm shrink-0 self-start sm:sm:self-center">
                          <span className="text-2xl font-black text-amber-600 font-mono tracking-tighter">
                            {activeMatrix.B}
                          </span>
                          <div className="text-left">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Miesiąc: {activeMonthName}</p>
                            <p className="text-[11px] font-black text-slate-700 leading-none mt-0.5">
                              {ARCANA_NAMES[activeMatrix.B] || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-3xl bg-white/75 backdrop-blur-sm p-6 rounded-2xl border border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left">
                          {STATIC_MONTH_INTERPRETATIONS[activeMatrix.B] ? (
                            STATIC_MONTH_INTERPRETATIONS[activeMatrix.B].split('\n\n').map((paragraph: string, idx: number) => (
                              <p key={idx} className="font-medium text-slate-700 mb-4 last:mb-0 leading-relaxed text-justify">
                                {paragraph}
                              </p>
                            ))
                          ) : (
                            <p className="font-medium text-slate-500">
                              Brak dostępnej interpretacji dla energii {activeMatrix.B}.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern minimal footer with user requested links */}
      <footer className="mt-8 border-t border-slate-200/60 pt-6 pb-12 w-full text-xs text-slate-400 font-medium relative z-10" id="app-footer">
        <div className="max-w-[1300px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-slate-400 font-mono tracking-wide text-[11px]" id="footer-copyright">
            © 2023-2026 Jmoon-numerology.com
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[11px] sm:text-xs" id="footer-links-container">
            <div className="flex items-center gap-5 border-b sm:border-b-0 sm:border-r border-slate-200/60 pb-3 sm:pb-0 sm:pr-5 justify-center" id="footer-socials">
              <a 
                href="https://www.instagram.com/j.moon777/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#E1306C] transition-colors duration-200 flex items-center gap-1.5 focus:outline-none"
                title="Instagram"
                id="link-instagram"
              >
                <Instagram size={14} className="w-[14px] h-[14px]" />
                <span className="text-[11px] font-mono">Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/JuliaMoon77777/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#1877F2] transition-colors duration-200 flex items-center gap-1.5 focus:outline-none"
                title="Facebook"
                id="link-facebook"
              >
                <Facebook size={14} className="w-[14px] h-[14px]" />
                <span className="text-[11px] font-mono">Facebook</span>
              </a>
              <a 
                href="https://www.youtube.com/@JULIAMOON-777/videos" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-400 hover:text-[#FF0000] transition-colors duration-200 flex items-center gap-1.5 focus:outline-none"
                title="YouTube"
                id="link-youtube"
              >
                <Youtube size={14} className="w-[14px] h-[14px]" />
                <span className="text-[11px] font-mono">YouTube</span>
              </a>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs" id="footer-links">
              <a 
                href="https://jmoon-numerology.com/regulamin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-slate-600 transition-colors duration-150 decoration-transparent hover:underline"
                id="link-regulamin"
              >
                Regulamin
              </a>
              <span className="text-slate-200">•</span>
              <a 
                href="https://jmoon-numerology.com/polityka_prywatnosci" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-slate-600 transition-colors duration-150 decoration-transparent hover:underline"
                id="link-privacy"
              >
                Polityka prywatności
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Insight mini row helper */
function InsightItem({ label, val }: { label: string; val: number }) {
  const guide = ARCANA_GUIDE[val];
  const name = ARCANA_NAMES[val];
  if (!guide) return null;

  return (
    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</span>
       <div className="flex items-center gap-2 mb-2">
         <span className="w-8 h-8 rounded-full bg-purple-150 text-[#a855f7] flex items-center justify-center font-black text-sm font-mono border border-purple-200/50">
           {val}
         </span>
         <span className="font-extrabold text-sm text-slate-800">{name}</span>
       </div>
       <p className="text-[10px] text-[#a855f7] font-bold mb-1 leading-tight">{guide.keywords}</p>
       <p className="text-[11px] text-slate-500 leading-relaxed italic">"{guide.advice}"</p>
    </div>
  );
}

/* Health Table component custom tailored like Image 2 */
function HealthTable({ chakras }: { chakras: any[] }) {
  const chakraSpecs = [
    { name: 'SAHASRARA', color: 'bg-purple-600', text: 'text-purple-600' },
    { name: 'AJNA', color: 'bg-blue-600', text: 'text-blue-600' },
    { name: 'VISHUDDHA', color: 'bg-cyan-500', text: 'text-cyan-500' },
    { name: 'ANAHATA', color: 'bg-green-600', text: 'text-green-600' },
    { name: 'MANIPURA', color: 'bg-yellow-400', text: 'text-yellow-500' },
    { name: 'SVADHISTANA', color: 'bg-orange-500', text: 'text-orange-500' },
    { name: 'MULADHARA', color: 'bg-red-600', text: 'text-red-500' },
  ];

  return (
    <div className="w-full">
      {/* Table Headers */}
      <div className="grid grid-cols-[1fr_1fr_1fr_2.5fr] gap-2 mb-4 pb-2 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
        <span>FIZYKA</span>
        <span>ENERGIA</span>
        <span>EMOCJA</span>
        <span className="text-left pl-3">CZAKRA</span>
      </div>

      {/* Row List */}
      <div className="space-y-3">
        {chakras.slice(0, 7).map((chakra, idx) => {
          const spec = chakraSpecs[idx];
          return (
             <div 
               key={idx} 
               className="grid grid-cols-[1fr_1fr_1fr_2.5fr] gap-2 items-center text-center py-1 transition-colors hover:bg-slate-50/50 rounded-xl"
             >
                {/* Physical */}
                <span className="text-base font-black text-slate-800 font-mono">
                  {chakra.physics}
                </span>

                {/* Energy */}
                <span className="text-base font-black text-slate-800 font-mono">
                  {chakra.energy}
                </span>

                {/* Emotion (colored dynamically by chakra color) */}
                <span className={`text-base font-black ${spec.text} font-mono`}>
                  {chakra.emotion}
                </span>

                {/* Chakra rounded sticker circle and name */}
                <div className="flex items-center gap-2.5 pl-3 text-left">
                   <div 
                     className={`w-7 h-7 rounded-full shrink-0 ${spec.color} text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-black/5 font-mono cursor-pointer transition-transform hover:scale-105`}
                     title={spec.name}
                   >
                     {7 - idx}
                   </div>
                   <span className="text-[11px] font-bold text-slate-700 leading-tight">
                     {spec.name}
                   </span>
                </div>
             </div>
          );
        })}

        {/* Total/Summary Row (Razem) */}
        {chakras[7] && (
           <div className="grid grid-cols-[1fr_1fr_1fr_2.5fr] gap-2 items-center text-center mt-5 pt-3 border-t-2 border-dashed border-slate-100">
              <span className="text-base font-black text-slate-400 font-mono">
                {chakras[7].physics}
              </span>
              <span className="text-base font-black text-slate-400 font-mono">
                {chakras[7].energy}
              </span>
              <span className="text-lg font-black text-slate-800 font-mono">
                {chakras[7].emotion}
              </span>
              <div className="flex items-center gap-2.5 pl-3 text-left">
                 <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shadow-sm font-mono shrink-0">
                   Σ
                 </div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">RAZEM</span>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

/* Stunning minimal Matrix Svg containing precisely calculated coordinates */
function MatrixSvg({ data }: { data: MatrixData }) {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-sm select-none" id="matrix-svg-diagram">
      <defs>
        {/* Soft floating shadows for nodes */}
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.08" />
        </filter>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#ca8a04" />
          <stop offset="75%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      <g style={{ isolation: 'isolate' }}>
        {/* Background concentric sacred geometry circles */}
        <circle cx="250" cy="250" r="200" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="250" cy="250" r="150" fill="none" stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="3 3" />
        <circle cx="250" cy="250" r="100" fill="none" stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 4" />
        <circle cx="250" cy="250" r="50" fill="none" stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Straight Axes */}
        <line x1="50" y1="250" x2="450" y2="250" stroke="#cbd5e1" strokeWidth="1.25" />
        <line x1="250" y1="50" x2="250" y2="450" stroke="#cbd5e1" strokeWidth="1.25" />
        
        {/* Diagonal Axes (Linia Mężczyzn - Blue, Linia Kobiet - Pink) */}
        <line x1="109" y1="109" x2="391" y2="391" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="391" y1="109" x2="109" y2="391" stroke="#f43f5e" strokeWidth="1.5" />

        {/* Diagonal text labels matching Image 1 */}
        <text x="165" y="152" transform="rotate(45 165 152)" style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', fontWeight: '800', fill: '#1d4ed8', textAnchor: 'middle' }}>Linia Mężczyzn</text>
        <text x="335" y="152" transform="rotate(-45 335 152)" style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', fontWeight: '800', fill: '#be185d', textAnchor: 'middle' }}>Linia Kobiet</text>

        {/* Straight Ancestral Square (F -> G -> H -> I -> F) */}
        <path d="M109 109 L391 109 L391 391 L109 391 Z" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Core Golden Destiny Diamond (B -> C -> D -> A -> B) */}
        <path d="M250 50 L450 250 L250 450 L50 250 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="3" filter="url(#soft-glow)" />

        {/* Love & Money Line (connecting D1 [250, 350] and C1 [350, 250]) */}
        <line x1="250" y1="350" x2="350" y2="250" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* ========================================================= */}
        {/* INTERMEDIATE AXIS NODES (Only the correct/standard ones) */}
        {/* ========================================================= */}
        
        {/* Left Axis (A to E) */}
        <g filter="url(#soft-shadow)">
          <circle cx="100" cy="250" r="10" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="100" y="250" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#1e3a8a', textAnchor: 'middle' }}>{data.A2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="150" cy="250" r="10" fill="white" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="150" y="250" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#0891b2', textAnchor: 'middle' }}>{data.A1}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="200" cy="250" r="10" fill="white" stroke="#10b981" strokeWidth="1.5" />
          <text x="200" y="250" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#065f46', textAnchor: 'middle' }}>{data.hearth}</text>
        </g>

        {/* Top Axis (B to E) */}
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="100" r="10" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="250" y="100" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#1e3a8a', textAnchor: 'middle' }}>{data.B2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="150" r="10" fill="white" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="250" y="150" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#0891b2', textAnchor: 'middle' }}>{data.B1}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="200" r="10" fill="white" stroke="#10b981" strokeWidth="1.5" />
          <text x="250" y="200" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#065f46', textAnchor: 'middle' }}>{data.hearthB}</text>
        </g>

        {/* Right Axis (C to E) */}
        <g filter="url(#soft-shadow)">
          <circle cx="400" cy="250" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="400" y="250" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.C2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="350" cy="250" r="10" fill="white" stroke="#f97316" strokeWidth="1.5" />
          <text x="350" y="250" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#c2410c', textAnchor: 'middle' }}>{data.C1}</text>
        </g>

        {/* Bottom Axis (D to E) */}
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="400" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="250" y="400" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.D2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="350" r="10" fill="white" stroke="#f97316" strokeWidth="1.5" />
          <text x="250" y="350" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#c2410c', textAnchor: 'middle' }}>{data.D1}</text>
        </g>

        {/* ========================================================= */}
        {/* INTERMEDIATE DIAGONAL ANCESTRAL NODES */}
        {/* ========================================================= */}

        {/* Top-Left Diagonal */}
        <g filter="url(#soft-shadow)">
          <circle cx="144.25" cy="144.25" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="144.25" y="144.25" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.F2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="179.5" cy="179.5" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="179.5" y="179.5" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.F1}</text>
        </g>

        {/* Top-Right Diagonal */}
        <g filter="url(#soft-shadow)">
          <circle cx="355.75" cy="144.25" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="355.75" y="144.25" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.G2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="320.5" cy="179.5" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="320.5" y="179.5" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.G1}</text>
        </g>

        {/* Bottom-Right Diagonal */}
        <g filter="url(#soft-shadow)">
          <circle cx="355.75" cy="355.75" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="355.75" y="355.75" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.H2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="320.5" cy="320.5" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="320.5" y="320.5" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.H1}</text>
        </g>

        {/* Bottom-Left Diagonal */}
        <g filter="url(#soft-shadow)">
          <circle cx="144.25" cy="355.75" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="144.25" y="355.75" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.I2}</text>
        </g>
        <g filter="url(#soft-shadow)">
          <circle cx="179.5" cy="320.5" r="10" fill="white" stroke="#1e293b" strokeWidth="1.5" />
          <text x="179.5" y="320.5" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '950', fontSize: '10px', fill: '#1e293b', textAnchor: 'middle' }}>{data.I1}</text>
        </g>

        {/* ========================================================= */}
        {/* RELATIONSHIP & MONEY NODES */}
        {/* ========================================================= */}

        {/* love node (Relationship point, 275, 325) */}
        <g filter="url(#soft-shadow)">
          <circle cx="275" cy="325" r="10" fill="white" stroke="#ec4899" strokeWidth="2" />
          <text x="275" y="325" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#be185d', textAnchor: 'middle' }}>{data.love}</text>
        </g>
        {/* Tiny floating pink heart graphic */}
        <g transform="translate(254, 324) scale(0.65)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ec4899" />
        </g>

        {/* love1 node (Shared balance point, 300, 300) */}
        <g filter="url(#soft-shadow)">
          <circle cx="300" cy="300" r="10" fill="white" stroke="#1e293b" strokeWidth="2" />
          <text x="300" y="300" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#0f172a', textAnchor: 'middle' }}>{data.love1}</text>
        </g>

        {/* money node (Finance point, 325, 275) */}
        <g filter="url(#soft-shadow)">
          <circle cx="325" cy="275" r="10" fill="white" stroke="#eab308" strokeWidth="2" />
          <text x="325" y="275" dy="3.5" style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '10px', fill: '#ca8a04', textAnchor: 'middle' }}>{data.money}</text>
        </g>
        {/* Tiny golden dollar badge */}
        <g transform="translate(328, 258) scale(0.7)">
          <circle cx="12" cy="12" r="9" fill="#eab308" />
          <text x="12" y="15.5" fill="white" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">$</text>
        </g>

        {/* ========================================================= */}
        {/* MAJOR CORNER/CARDINAL NODES */}
        {/* ========================================================= */}

        {/* Center Focal Circle (Yellow / Gold border representing comfort zone E) */}
        <circle cx="250" cy="250" r="22" fill="white" stroke="url(#gold-gradient)" strokeWidth="4.5" filter="url(#soft-shadow)" />
        <text x="250" y="250" dy="5.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '16px', fill: '#b45309', textAnchor: 'middle' }}>
          {data.E}
        </text>
        <text x="250" y="286" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '800', fontSize: '9px', fill: '#b45309', textAnchor: 'middle' }}>Strefa Komfortu</text>

        {/* Top Node (B) for spiritual (20 yrs) - Purple border */}
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="50" r="17" fill="white" stroke="#c084fc" strokeWidth="3" />
          <text x="250" y="50" dy="5.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '14px', fill: '#7e22ce', textAnchor: 'middle' }}>
            {data.B}
          </text>
        </g>

        {/* Left Node (A) for birth (0 yrs) - Purple border */}
        <g filter="url(#soft-shadow)">
          <circle cx="50" cy="250" r="17" fill="white" stroke="#c084fc" strokeWidth="3" />
          <text x="50" y="250" dy="5.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '14px', fill: '#7e22ce', textAnchor: 'middle' }}>
            {data.A}
          </text>
        </g>

        {/* Bottom Node (D) for ancestral/karma (60 yrs) - Red border */}
        <g filter="url(#soft-shadow)">
          <circle cx="250" cy="450" r="17" fill="white" stroke="#f87171" strokeWidth="3" />
          <text x="250" y="450" dy="5.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '14px', fill: '#dc2626', textAnchor: 'middle' }}>
            {data.D}
          </text>
        </g>

        {/* Right Node (C) for material/finance (40 yrs) - Orange/Red border */}
        <g filter="url(#soft-shadow)">
          <circle cx="450" cy="250" r="17" fill="white" stroke="#f87171" strokeWidth="3" />
          <text x="450" y="250" dy="5.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '14px', fill: '#dc2626', textAnchor: 'middle' }}>
            {data.C}
          </text>
        </g>

        {/* Top-Left node (F) (10 yrs) - Slate border */}
        <g filter="url(#soft-shadow)">
          <circle cx="109" cy="109" r="15" fill="white" stroke="#475569" strokeWidth="2" />
          <text x="109" y="109" dy="4.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '12px', fill: '#334155', textAnchor: 'middle' }}>
            {data.F}
          </text>
        </g>

        {/* Top-Right node (G) (30 yrs) - Slate border */}
        <g filter="url(#soft-shadow)">
          <circle cx="391" cy="109" r="15" fill="white" stroke="#475569" strokeWidth="2" />
          <text x="391" y="109" dy="4.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '12px', fill: '#334155', textAnchor: 'middle' }}>
            {data.G}
          </text>
        </g>

        {/* Bottom-Right node (H) (50 yrs) - Slate border */}
        <g filter="url(#soft-shadow)">
          <circle cx="391" cy="391" r="15" fill="white" stroke="#475569" strokeWidth="2" />
          <text x="391" y="391" dy="4.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '12px', fill: '#334155', textAnchor: 'middle' }}>
            {data.H}
          </text>
        </g>

        {/* Bottom-Left node (I) (70 yrs) - Slate border */}
        <g filter="url(#soft-shadow)">
          <circle cx="109" cy="391" r="15" fill="white" stroke="#475569" strokeWidth="2" />
          <text x="109" y="391" dy="4.5" style={{ fontFamily: 'Outfit, Inter, sans-serif', fontWeight: '900', fontSize: '12px', fill: '#334155', textAnchor: 'middle' }}>
            {data.I}
          </text>
        </g>

      </g>
    </svg>
  );
}
