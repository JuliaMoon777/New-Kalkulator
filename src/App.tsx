import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Calendar, Activity, ScrollText, 
  Heart, Wallet, Star, Shield, 
  ChevronRight, RefreshCw, User, Users,
  Heart as HeartIcon, DollarSign, Sparkles, Brain, 
  Gem, Map
} from 'lucide-react';
import { calculateMatrix, calculateCompatibility, calculateAge, type MatrixData, ARCANA_GUIDE, ARCANA_NAMES } from './utils/matrixUtils';

export default function App() {
  const [person1, setPerson1] = useState({ dob: '01.01.1990', name: '' });
  const [person2, setPerson2] = useState({ dob: '15.05.1995', name: '' });
  const [mode, setMode] = useState<'single' | 'compatibility'>('single');
  const [view, setView] = useState<'p1' | 'p2' | 'common'>('p1');
  const [result, setResult] = useState<{ m1?: MatrixData; m2?: MatrixData; common?: MatrixData }>({});

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-pink-100/30 rounded-full blur-[110px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pt-8 md:pt-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 mb-12"
          >
             <p className="text-xs font-bold text-slate-400 tracking-[0.4em] uppercase mb-[-1.5rem]">System Samopoznania</p>
             <div className="w-32 h-32 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                <img src="https://i.postimg.cc/wvF033Vy/Logo-no-JM.png" alt="Logo" className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" />
             </div>
             <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
                  Matryca <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Losu</span>
                </h1>
             </div>
          </motion.div>

          <div className="relative bg-white/40 backdrop-blur-3xl p-1.5 rounded-[2.5rem] shadow-sm mb-12 flex items-center border border-white/60">
            <motion.div
              className="absolute inset-y-1.5 rounded-full bg-white shadow-xl shadow-slate-200/50"
              initial={false}
              animate={{
                left: mode === 'single' ? '6px' : '50%',
                right: mode === 'single' ? '50%' : '6px',
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button 
              onClick={() => { setMode('single'); setView('p1'); }}
              className={`relative z-10 px-10 py-3.5 rounded-full text-xs font-black tracking-widest transition-colors ${mode === 'single' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              INDYWIDUALNA
            </button>
            <button 
              onClick={() => setMode('compatibility')}
              className={`relative z-10 px-10 py-3.5 rounded-full text-xs font-black tracking-widest transition-colors ${mode === 'compatibility' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              KOMPATYBILNOŚĆ
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl px-4">
            <div className="flex-1 min-w-[320px]">
              <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
                       <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Osoba 1</p>
                      <input 
                         value={person1.name}
                         onChange={(e) => setPerson1(p => ({ ...p, name: e.target.value }))}
                         placeholder="Wpisz imię..."
                         className="bg-transparent border-none focus:ring-0 font-black text-xl placeholder:text-slate-300 w-full p-0"
                      />
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Data urodzenia</p>
                      <input 
                         value={person1.dob}
                         onChange={(e) => handleDateChange(e.target.value, setPerson1)}
                         placeholder="DD.MM.YYYY"
                         className="bg-transparent border-none focus:ring-0 font-black text-2xl w-full p-0"
                      />
                    </div>
                 </div>
              </div>
            </div>

            {mode === 'compatibility' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 min-w-[320px]"
              >
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/30 rounded-full blur-3xl -mr-16 -mt-16" />
                   <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500 shadow-inner">
                         <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Osoba 2</p>
                        <input 
                           value={person2.name}
                           onChange={(e) => setPerson2(p => ({ ...p, name: e.target.value }))}
                           placeholder="Wpisz imię..."
                           className="bg-transparent border-none focus:ring-0 font-black text-xl placeholder:text-slate-300 w-full p-0"
                        />
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 relative z-10">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Data urodzenia</p>
                        <input 
                           value={person2.dob}
                           onChange={(e) => handleDateChange(e.target.value, setPerson2)}
                           placeholder="DD.MM.YYYY"
                           className="bg-transparent border-none focus:ring-0 font-black text-2xl w-full p-0"
                        />
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content Tabs for Compatibility Mode */}
        {mode === 'compatibility' && (
          <div className="flex justify-center mb-10 gap-4">
            {['p1', 'common', 'p2'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/60 text-slate-400 hover:bg-white'
                }`}
              >
                {v === 'p1' ? (person1.name || 'Osoba 1') : v === 'p2' ? (person2.name || 'Osoba 2') : 'DOPASOWANIE'}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {activeMatrix && (
                <motion.div 
                  key={mode + (person1.dob) + (person2.dob) + view}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-[950px] aspect-square relative mb-8 md:mb-12 bg-white/20 backdrop-blur-lg rounded-full p-4 sm:p-8 shadow-2xl border border-white/30 flex items-center justify-center">
                    <MatrixSvg 
                      data={activeMatrix} 
                    />
                  </div>

                  {/* Results Bottom Detail */}
                  <div className="w-full flex flex-col md:flex-row justify-center items-center gap-8 px-4 sm:px-10 py-6 sm:py-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-center sm:text-left mb-0.5">Wiek</p>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 text-center sm:text-left">
                          {mode === 'single' ? (age1 || '-') : (view === 'p1' ? (age1 || '-') : view === 'p2' ? (age2 || '-') : `${age1} | ${age2}`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-12">
                       <DestinyCard 
                          label="1 pr-e (20-40 lat)"
                          subLabel="Znalezienie siebie"
                          val1={activeMatrix.sky}
                          val2={activeMatrix.earth}
                          sum={activeMatrix.personal}
                          labels={['NIEBO', 'ZIEMIA']}
                        />
                        <DestinyCard 
                          label="2 pr-e (40-60 lat)"
                          subLabel="Socjalizacja"
                          val1={activeMatrix.male}
                          val2={activeMatrix.female}
                          sum={activeMatrix.social}
                          labels={['MĘSKA', 'ŻEŃSKA']}
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 mb-12 w-full">
                       <DestinyMini 
                          label="3 pr-e (od 60 lat)"
                          subLabel="Przeznaczenie Duchowe"
                          val={activeMatrix.spiritual}
                        />
                        <DestinyMini 
                          label="4 pr-e"
                          subLabel="Korzyść"
                          val={activeMatrix.planetary}
                          dark
                        />
                    </div>

                    {/* INTERACTIVE TIPS / INSIGHTS */}
                    <div className="md:col-span-2 mt-8 md:mt-12 mb-12 md:mb-20 bg-purple-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 sm:p-8 md:p-12 border border-purple-100/50 shadow-inner">
                       <h3 className="text-lg md:text-xl font-black text-purple-900 mb-8 md:mb-10 flex items-center gap-4">
                          <ScrollText className="w-6 h-6" /> {mode === 'compatibility' && view === 'common' ? "Wspólne Wglądy (Związek)" : "Kluczowe Wglądy (Głębokie Porady)"}
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Charakter Związku" : "Twój Charakter (Centrum)"} 
                            val={activeMatrix.E} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Wspólna Duchowość" : "Twoja Wyższa Jaźń (Duch)"} 
                            val={activeMatrix.B} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Wspólna Karma Związku" : "Zadanie Karmiczne"} 
                            val={activeMatrix.D} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Wspólne Finanse" : "Moc Finansowa"} 
                            val={activeMatrix.money} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Atmosfera w Relacji" : "Otwarcie Serca"} 
                            val={activeMatrix.love} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                          <InsightRow 
                            label={mode === 'compatibility' && view === 'common' ? "Wspólny Potencjał Rodowy" : "Talent Rodowy"} 
                            val={activeMatrix.F} 
                            isCompatibility={mode === 'compatibility' && view === 'common'}
                          />
                       </div>
                       <p className="mt-12 text-center text-[10px] uppercase font-black tracking-[0.2em] text-purple-300">Krótkie wskazówki systemu Matrycy Przeznaczenia — traktuj je jako drogowskaz.</p>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Karta Zdrowia & Analysis */}
          {activeMatrix && view !== 'common' && (
            <div className="w-full lg:w-[480px] lg:sticky lg:top-10 lg:order-2">
               <div className="text-center mb-6 md:mb-8">
                 <h2 className="text-3xl font-black text-black uppercase tracking-widest">Karta Zdrowia</h2>
                 {mode === 'compatibility' && <p className="text-xs font-bold text-purple-400 mt-2">WSPÓLNA ENERGIA PARY</p>}
               </div>
               
               <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/80 shadow-xl"
               >
                  <HealthTable chakras={activeMatrix.chakras} />
               </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightRow({ label, val, isCompatibility }: { label: string; val: number; isCompatibility?: boolean }) {
  const guide = ARCANA_GUIDE[val];
  const name = ARCANA_NAMES[val];
  
  if (!guide) return null;

  return (
    <div className="bg-white/40 p-6 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-200 shrink-0">
          {val}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-slate-900">{name}</h4>
          </div>
          <p className="text-[11px] font-bold text-purple-500 mb-2">{guide.keywords}</p>
          
          <div className="space-y-3">
             <div className="p-4 bg-white/60 rounded-2xl border border-purple-50 text-xs italic text-slate-600 leading-relaxed group-hover:text-purple-700 transition-colors">
               "{guide.advice}"
             </div>
             {isCompatibility && (
               <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-xs font-bold text-pink-700 leading-relaxed">
                  <span className="block text-[9px] uppercase tracking-widest text-pink-400 mb-1">Porady dla par:</span>
                  {guide.coupleAdvice}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinyCard({ label, subLabel, val1, val2, sum, labels, dark }: any) {
  return (
    <div className={`p-6 rounded-[2.5rem] border ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'} shadow-sm`}>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{label}</p>
          <h3 className="text-sm font-black uppercase tracking-wider">{subLabel}</h3>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-4">
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border ${dark ? 'border-slate-700' : 'border-slate-100'}`}>{val1}</div>
              <p className="text-[8px] mt-1 font-bold opacity-30 tracking-tighter">{labels[0]}</p>
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border ${dark ? 'border-slate-700' : 'border-slate-100'}`}>{val2}</div>
              <p className="text-[8px] mt-1 font-bold opacity-30 tracking-tighter">{labels[1]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="w-14 h-14 rounded-full bg-purple-600 shadow-xl shadow-purple-200 flex items-center justify-center text-white text-xl font-black">{sum}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinyMini({ label, subLabel, val, dark }: any) {
  return (
    <div className={`p-6 rounded-[2.5rem] flex-1 border ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'} shadow-sm`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-left">{label}</p>
          <h3 className="text-sm font-black uppercase tracking-wider text-left">{subLabel}</h3>
        </div>
        <div className={`w-14 h-14 rounded-full ${dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-black/10`}>
          {val}
        </div>
      </div>
    </div>
  );
}

function HealthTable({ chakras }: { chakras: any[] }) {
  const labels = ['Fizyka', 'Energia', 'Emocja', 'Czakra'];
  const chakraSpecs = [
    { bg: 'bg-purple-600', color: 'text-purple-600', name: '7' },
    { bg: 'bg-blue-600', color: 'text-blue-600', name: '6' },
    { bg: 'bg-cyan-500', color: 'text-cyan-500', name: '5' },
    { bg: 'bg-green-600', color: 'text-green-600', name: '4' },
    { bg: 'bg-yellow-400', color: 'text-yellow-500', name: '3' },
    { bg: 'bg-orange-500', color: 'text-orange-500', name: '2' },
    { bg: 'bg-red-600', color: 'text-red-600', name: '1' },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-4 gap-4 px-4">
        {labels.map(l => (
          <div key={l} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{l}</div>
        ))}
      </div>
      
      <div className="space-y-2">
        {chakras.slice(0, 7).map((chakra, idx) => {
          const spec = chakraSpecs[idx];
          return (
            <motion.div 
              key={chakra.name} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-4 gap-3 items-center bg-white/40 p-2 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors"
            >
              <div className="text-2xl font-black text-slate-800 text-center font-mono">{chakra.physics}</div>
              <div className="text-2xl font-black text-slate-800 text-center font-mono">{chakra.energy}</div>
              <div className={`text-2xl font-black ${spec.color} text-center font-mono`}>{chakra.emotion}</div>
              <div className="flex justify-center">
                <div className={`w-10 h-10 rounded-xl ${spec.bg} text-white flex items-center justify-center text-lg font-black shadow-lg`}>
                  {spec.name}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Row */}
      {chakras[7] && (
        <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-100 px-2">
          <div className="grid grid-cols-4 gap-3 items-center">
            <div className="text-2xl font-black text-slate-300 text-center font-mono">{chakras[7].physics}</div>
            <div className="text-2xl font-black text-slate-300 text-center font-mono">{chakras[7].energy}</div>
            <div className="text-3xl font-black text-slate-900 text-center font-mono drop-shadow-sm">{chakras[7].emotion}</div>
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center text-xl font-black rounded-xl shadow-xl">Σ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixSvg({ data }: { data: MatrixData }) {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-2xl">
      <defs>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bf953f" />
          <stop offset="25%" stopColor="#fcf6ba" />
          <stop offset="50%" stopColor="#b38728" />
          <stop offset="75%" stopColor="#fcf6ba" />
          <stop offset="100%" stopColor="#aa771c" />
        </linearGradient>
      </defs>
      
      <g style={{ isolation: 'isolate' }}>
        {/* Outer Circle Glow */}
        <circle cx="250" cy="250" r="200" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.5" />
        
        {/* Core Geometry (Square and Rhombus) */}
        <path d="M250 50 L450 250 L250 450 L50 250 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="3" filter="url(#soft-glow)" />
        <path d="M109 109 L391 109 L391 391 L109 391 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.6" />

        {/* Diagonal Axis (Intermediate) */}
        <line x1="50" y1="250" x2="450" y2="250" stroke="#f1f5f9" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="250" y1="50" x2="250" y2="450" stroke="#f1f5f9" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="109" y1="109" x2="391" y2="391" stroke="#f1f5f9" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="391" y1="109" x2="109" y2="391" stroke="#f1f5f9" strokeWidth="1" strokeOpacity="0.2" />
        
        {/* Major Nodes (Destiny Cross) */}
        <circle cx="250" cy="50" r="18" fill="#fff" stroke="#9333ea" strokeWidth="3" filter="url(#soft-glow)" />
        <circle cx="450" cy="250" r="18" fill="#fff" stroke="#dc2626" strokeWidth="3" filter="url(#soft-glow)" />
        <circle cx="250" cy="450" r="18" fill="#fff" stroke="#dc2626" strokeWidth="3" filter="url(#soft-glow)" />
        <circle cx="50" cy="250" r="18" fill="#fff" stroke="#9333ea" strokeWidth="3" filter="url(#soft-glow)" />
        
        {/* Ancestral Nodes (Corners) */}
        <circle cx="109" cy="109" r="15" fill="#fff" stroke="#475569" strokeWidth="2.5" />
        <circle cx="391" cy="109" r="15" fill="#fff" stroke="#475569" strokeWidth="2.5" />
        <circle cx="391" cy="391" r="15" fill="#fff" stroke="#475569" strokeWidth="2.5" />
        <circle cx="109" cy="391" r="15" fill="#fff" stroke="#475569" strokeWidth="2.5" />

        {/* Center Focal Node */}
        <circle cx="250" cy="250" r="24" fill="#fff" stroke="url(#gold-gradient)" strokeWidth="6" filter="url(#soft-glow)" />

        {/* Numeric Overlay */}
        <g style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: '900', textAnchor: 'middle', fill: '#1e293b' }}>
           {/* Center */}
           <text x="250" y="259" style={{ fontSize: '20px' }}>{data.E}</text>
           
           {/* Destiny Cross */}
           <text x="50" y="256" style={{ fontSize: '15px' }}>{data.A}</text>
           <text x="250" y="56" style={{ fontSize: '15px' }}>{data.B}</text>
           <text x="450" y="256" style={{ fontSize: '15px' }}>{data.C}</text>
           <text x="250" y="456" style={{ fontSize: '15px' }}>{data.D}</text>

           {/* Ancestral Points */}
           <text x="109" y="115" style={{ fontSize: '13px', fill: '#475569' }}>{data.F}</text>
           <text x="391" y="115" style={{ fontSize: '13px', fill: '#475569' }}>{data.G}</text>
           <text x="391" y="397" style={{ fontSize: '13px', fill: '#475569' }}>{data.H}</text>
           <text x="109" y="397" style={{ fontSize: '13px', fill: '#475569' }}>{data.I}</text>
        </g>
      </g>
    </svg>
  );
}

// Remove AgeMap function as it's no longer used
