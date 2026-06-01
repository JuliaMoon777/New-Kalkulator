import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Calendar, Activity, ScrollText, 
  Heart, Wallet, Star, Shield, 
  ChevronRight, RefreshCw, User, Users,
  Heart as HeartIcon, DollarSign, Sparkles, Brain, 
  Gem, Map, Gift, Compass, Share2, Check
} from 'lucide-react';
import { calculateMatrix, calculateCompatibility, calculateAge, type MatrixData, ARCANA_GUIDE, ARCANA_NAMES } from './utils/matrixUtils';

function encodeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    try {
      return atob(str);
    } catch (err) {
      return '';
    }
  }
}

export default function App() {
  const [person1, setPerson1] = useState({ dob: '19.01.1994', name: '' });
  const [person2, setPerson2] = useState({ dob: '15.05.1995', name: '' });
  const [mode, setMode] = useState<'single' | 'compatibility'>('single');
  const [view, setView] = useState<'p1' | 'p2' | 'common'>('p1');
  const [result, setResult] = useState<{ m1?: MatrixData; m2?: MatrixData; common?: MatrixData }>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p1Dob = params.get('p1');
      const p2Dob = params.get('p2');
      const n1Name = params.get('n1');
      const n2Name = params.get('n2');
      const urlMode = params.get('m');

      if (p1Dob) {
        const decodedDob = decodeBase64(p1Dob);
        if (decodedDob && decodedDob.length === 10) {
          setPerson1(prev => ({ ...prev, dob: decodedDob }));
        }
      }
      if (n1Name) {
        const decodedName = decodeBase64(n1Name);
        if (decodedName) {
          setPerson1(prev => ({ ...prev, name: decodedName }));
        }
      }
      if (p2Dob) {
        const decodedDob = decodeBase64(p2Dob);
        if (decodedDob && decodedDob.length === 10) {
          setPerson2(prev => ({ ...prev, dob: decodedDob }));
        }
      }
      if (n2Name) {
        const decodedName = decodeBase64(n2Name);
        if (decodedName) {
          setPerson2(prev => ({ ...prev, name: decodedName }));
        }
      }
      if (urlMode === 'compatibility' || urlMode === 'single') {
        setMode(urlMode as 'single' | 'compatibility');
        if (urlMode === 'compatibility') {
          setView('common');
        }
      }
    } catch (err) {
      console.error('Error parsing loaded URL parameters:', err);
    }
  }, []);

  const handleShare = () => {
    try {
      const params = new URLSearchParams();
      if (person1.dob) {
        params.set('p1', encodeBase64(person1.dob));
      }
      if (person1.name) {
        params.set('n1', encodeBase64(person1.name));
      }
      if (mode === 'compatibility') {
        params.set('m', 'compatibility');
        if (person2.dob) {
          params.set('p2', encodeBase64(person2.dob));
        }
        if (person2.name) {
          params.set('n2', encodeBase64(person2.name));
        }
      } else {
        params.set('m', 'single');
      }

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Error generating share link:', err);
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
                  MATRYCA <span className="text-[#a855f7]">LOSU</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.34em] uppercase mt-1">SYSTEM SAMOPOZNANIA</p>
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
              KOMPATYBILNOŚĆ
            </button>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl px-2" id="inputs-wrapper">
            {/* Person 1 Input */}
            <div className="flex-1 min-w-[280px]">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    {mode === 'compatibility' ? 'OSOBA 1' : 'DANE ANALIZYWANE'}
                  </p>
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
                             placeholder="19.01.1994"
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
                               placeholder="DD.MM.YYYY"
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

          {/* Share Button Block */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-center"
            id="share-button-container"
          >
            <button
              onClick={handleShare}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
                copied 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300'
              }`}
              id="btn-share-matrix"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white">Skopiowano link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#a855f7]" />
                  <span>Udostępnij matrycę</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Content Tabs for Compatibility View Options */}
        {mode === 'compatibility' && (
          <div className="flex justify-center mb-8 gap-2 px-4" id="compatibility-subtabs">
            {[
              { id: 'p1', label: person1.name || 'Osoba 1' },
              { id: 'common', label: 'KOMPATYBILNOŚĆ (Pary)' },
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
                  className="bg-gradient-to-br from-[#1e293b] to-[#111827] text-white rounded-[2rem] p-8 shadow-xl"
                  id="compatibility-info-card"
                >
                  <h2 className="text-sm font-black text-[#fbcfe8] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#ec4899]" /> ANALIZA ZWIĄZKU
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Ten widok prezentuje połączone energie obojga partnerów wyliczone według tradycyjnego systemu Matrycy Przeznaczenia. 
                    Sumaryczny punkt komfortu, karmy rodowej oraz linie męskie/żeńskie obrazują synergię Waszej relacji.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Wspólna Karma Rodowa</p>
                        <p className="text-xs text-slate-200 mt-0.5">Łączna siła i lekcje obojga</p>
                      </div>
                      <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold flex items-center justify-center border border-purple-500/30 font-mono text-sm">
                        {activeMatrix.ancestralStrength}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Wewnętrzna Energia Pary</p>
                        <p className="text-xs text-slate-200 mt-0.5">Wzajemne przeznaczenie podświadome</p>
                      </div>
                      <span className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 font-extrabold flex items-center justify-center border border-pink-500/30 font-mono text-sm font-mono">
                        {activeMatrix.E}
                      </span>
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
                  WIEK & DETALE ETAPÓW
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="fate-cards-grid">
                
                {/* Card 1: Znalezienie siebie */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between" id="card-stage-1">
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">1 pr-e</p>
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5">ZNALEZIENIE SIEBIE</p>
                     
                     <div className="mt-4 flex gap-4 text-[11px] text-slate-450 border-t border-slate-50 pt-3">
                        <div>
                          <span className="font-bold text-slate-400">Niebo:</span> <span className="font-black text-slate-750">{activeMatrix.sky}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400">Ziemia:</span> <span className="font-black text-slate-750">{activeMatrix.earth}</span>
                        </div>
                     </div>
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
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5">SOCJALIZACJA</p>
                     
                     <div className="mt-4 flex gap-4 text-[11px] text-slate-450 border-t border-slate-50 pt-3">
                        <div>
                          <span className="font-bold text-slate-400">Męska:</span> <span className="font-black text-slate-750">{activeMatrix.male}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400">Żeńska:</span> <span className="font-black text-slate-750">{activeMatrix.female}</span>
                        </div>
                     </div>
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
                     <p className="text-sm font-black text-slate-800 uppercase mt-0.5 leading-tight">PRZEZNACZENIE DUCHOWE</p>
                     <p className="text-[10px] text-slate-400 mt-2 italic">Podsumowująca wibracja sfery ducha</p>
                   </div>
                   
                   <div className="flex justify-end mt-6">
                      <div className="w-12 h-12 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-extrabold text-base shadow-md font-mono">
                        {activeMatrix.spiritual}
                      </div>
                   </div>
                </div>

                {/* Card 4: Korzyść (black styled block exactly as requested) */}
                <div className="bg-[#1e293b] text-white rounded-[2rem] p-6 shadow-lg flex flex-col justify-between relative overflow-hidden" id="card-stage-korzysc">
                   {/* Background circular highlight to pop visually */}
                   <div className="absolute top-[-20%] right-[-10%] w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
                   
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">4 pr-e</p>
                     <p className="text-sm font-black text-[#faf5ff] uppercase mt-0.5 leading-tight">KORZYŚĆ</p>
                     <p className="text-[10px] text-slate-300 mt-2 italic">Ostateczny dar przeznaczenia</p>
                   </div>
                   
                   <div className="flex justify-end mt-6 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-white text-[#1e293b] flex items-center justify-center font-extrabold text-base shadow-md font-mono">
                        {activeMatrix.planetary}
                      </div>
                   </div>
                </div>
              </div>

              {/* Minimalist Cards for Ancestral strength and Power code display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="additional-blocks-row">
                 
                 {/* Siła przodkówCard */}
                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.015)] flex items-center justify-between" id="card-additional-ancestral">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                          <Compass className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SIŁA PRZODKÓW</p>
                          <p className="text-xs text-slate-400 mt-0.5">Potencjał rodów męskich i żeńskich</p>
                       </div>
                    </div>
                    <span className="text-2xl font-black text-[#1e293b] font-mono px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {activeMatrix.ancestralStrength}
                    </span>
                 </div>

                 {/* Wewnętrzny kod siły Card */}
                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.015)] flex items-center justify-between" id="card-additional-powercode">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#a855f7] shrink-0">
                          <Zap className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">WEWNĘTRZNY KOD SIŁY</p>
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
                         {activeMatrix.E + activeMatrix.internalPower > 22 
                           ? String(activeMatrix.E + activeMatrix.internalPower).split('').reduce((a,b)=>a+Number(b),0) > 22
                             ? (String(activeMatrix.E + activeMatrix.internalPower).split('').reduce((a,b)=>a+Number(b),0) - 22)
                             : String(activeMatrix.E + activeMatrix.internalPower).split('').reduce((a,b)=>a+Number(b),0)
                           : activeMatrix.E + activeMatrix.internalPower}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Interpretation Blocks (Darmic/Life Guides) */}
              {view !== 'common' && (
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] mt-10" id="insights-section">
                   <h3 className="text-sm font-black text-slate-800 tracking-wider mb-6 flex items-center gap-2">
                     <ScrollText className="w-4 h-4 text-[#a855f7]" /> INTERPRETACJA KLUCZOWYCH ENERGII
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InsightItem label="Twój Charakter (Centrum)" val={activeMatrix.E} />
                      <InsightItem label="Twoja Wyższa Jaźń (Duch)" val={activeMatrix.B} />
                      <InsightItem label="Przeznaczenie Karmiczne" val={activeMatrix.D} />
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern minimal footer with user requested links */}
      <footer className="mt-8 border-t border-slate-200/60 pt-6 pb-12 w-full text-xs text-slate-400 font-medium relative z-10" id="app-footer">
        <div className="max-w-[1300px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-400 font-mono tracking-wide text-[11px]" id="footer-copyright">
            © 2023-2026 Jmoon-numerology.com
          </span>
          <div className="flex items-center gap-6 text-[11px] sm:text-xs" id="footer-links">
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
    { name: '7. Sahasrara (misja)', color: 'bg-purple-600', text: 'text-purple-600' },
    { name: '6. Ajna (los egregory)', color: 'bg-blue-600', text: 'text-blue-600' },
    { name: '5. Vishuddha', color: 'bg-cyan-500', text: 'text-cyan-500' },
    { name: '4. Anahata', color: 'bg-green-600', text: 'text-green-600' },
    { name: '3. Manipura', color: 'bg-yellow-400', text: 'text-yellow-500' },
    { name: '2. Svadhistana', color: 'bg-orange-500', text: 'text-orange-500' },
    { name: '1. Muladhara', color: 'bg-red-600', text: 'text-red-500' },
  ];

  return (
    <div className="w-full">
      {/* Table Headers */}
      <div className="grid grid-cols-4 gap-2 mb-4 pb-2 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
        <span>FIZYKA</span>
        <span>ENERGIA</span>
        <span>EMOCJA</span>
        <span>CZAKRA</span>
      </div>

      {/* Row List */}
      <div className="space-y-3">
        {chakras.slice(0, 7).map((chakra, idx) => {
          const spec = chakraSpecs[idx];
          return (
             <div 
               key={idx} 
               className="grid grid-cols-4 gap-2 items-center text-center py-1 transition-colors hover:bg-slate-50/50 rounded-xl"
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

                {/* Chakra rounded sticker circle */}
                <div className="flex justify-center">
                   <div 
                     className={`w-8 h-8 rounded-full ${spec.color} text-white flex items-center justify-center text-xs font-black shadow-md shadow-black/5 font-mono cursor-pointer transition-transform hover:scale-105`}
                     title={spec.name}
                   >
                     {7 - idx}
                   </div>
                </div>
             </div>
          );
        })}

        {/* Total/Summary Row (Razem) */}
        {chakras[7] && (
           <div className="grid grid-cols-4 gap-2 items-center text-center mt-5 pt-3 border-t-2 border-dashed border-slate-100">
              <span className="text-base font-black text-slate-400 font-mono">
                {chakras[7].physics}
              </span>
              <span className="text-base font-black text-slate-400 font-mono">
                {chakras[7].energy}
              </span>
              <span className="text-lg font-black text-slate-800 font-mono">
                {chakras[7].emotion}
              </span>
              <div className="flex justify-center">
                 <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shadow-sm font-mono">
                   Σ
                 </div>
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
