/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, User, Calculator, Heart, DollarSign, Zap, ScrollText, Activity } from 'lucide-react';
import { calculateMatrix, calculateCompatibility, MatrixData, ARCANA_NAMES, reduceTo22, calculateAge } from './utils/matrixUtils';

type Mode = 'single' | 'compatibility';

export default function App() {
  const [mode, setMode] = useState<Mode>('single');
  const [person1, setPerson1] = useState({ name: '', dob: '' });
  const [person2, setPerson2] = useState({ name: '', dob: '' });
  const [result, setResult] = useState<{
    m1: MatrixData | null;
    m2: MatrixData | null;
    common: MatrixData | null;
  }>({ m1: null, m2: null, common: null });

  const formatDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 8);
    
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  };

  const handleDobChange = (p: 'p1' | 'p2', value: string) => {
    const formatted = formatDate(value);
    if (p === 'p1') {
      setPerson1(prev => ({ ...prev, dob: formatted }));
    } else {
      setPerson2(prev => ({ ...prev, dob: formatted }));
    }
  };

  const handleCalculate = () => {
    const m1 = person1.dob ? calculateMatrix(person1.dob) : null;
    const m2 = person2.dob && mode === 'compatibility' ? calculateMatrix(person2.dob) : null;
    const common = m1 && m2 ? calculateCompatibility(m1, m2) : null;
    
    setResult({ m1, m2, common });
  };

  const age1 = useMemo(() => calculateAge(person1.dob), [person1.dob]);
  const age2 = useMemo(() => calculateAge(person2.dob), [person2.dob]);

  const activeMatrix = mode === 'compatibility' ? result.common : result.m1;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-purple-100 py-12 bg-[radial-gradient(circle_at_20%_20%,_#f3e8ff_0%,_#ffffff_100%)]">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Modern Header / Mode Toggle */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex p-1.5 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white mb-6">
            <button
              onClick={() => setMode('single')}
              className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-sm font-black transition-all duration-500 ${
                mode === 'single' 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-105' 
                  : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              <User className="w-4 h-4" /> INDYWIDUALNA
            </button>
            <button
              onClick={() => setMode('compatibility')}
              className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-sm font-black transition-all duration-500 ${
                mode === 'compatibility' 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 scale-105' 
                  : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              <Users className="w-4 h-4" /> PARTNERSKA
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-between gap-16 items-start">
          
          {/* LEFT COLUMN: Inputs & Matrix */}
          <div className="w-full xl:w-[800px] flex flex-col items-center">
            
            {/* Inputs Block - Glass Effect */}
            <div className="w-full bg-white/60 backdrop-blur-2xl rounded-[3.5rem] p-12 border border-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-b border-white/60 pb-4 flex items-center gap-3">
                     <User className="w-5 h-5 text-indigo-400" /> {mode === 'compatibility' ? 'Partner 1' : 'Twoje Dane'}
                   </h3>
                   <div className="space-y-8 font-bold">
                     <div className="flex flex-col gap-2">
                        <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Imię</span>
                        <input 
                          type="text" 
                          value={person1.name}
                          onChange={(e) => setPerson1(p => ({...p, name: e.target.value}))}
                          className="bg-white/40 border-b-2 border-slate-100/50 focus:border-black outline-none text-2xl h-12 w-full transition-all px-2 rounded-t-lg"
                          placeholder="np. Jan"
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Data urodzenia (d.m.r)</span>
                        <input 
                          type="text" 
                          value={person1.dob}
                          placeholder="DD.MM.RRRR"
                          onChange={(e) => handleDobChange('p1', e.target.value)}
                          className="bg-white/40 border-b-2 border-slate-100/50 focus:border-black outline-none text-2xl h-12 w-full transition-all px-2 rounded-t-lg"
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Wiek</span>
                        <div className="border-b-2 border-slate-100/50 text-2xl h-12 flex items-center text-slate-400 px-2">
                          {age1 > 0 ? age1 : '-'}
                        </div>
                     </div>
                   </div>
                </div>

                {mode === 'compatibility' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-b border-white/60 pb-4 flex items-center gap-3">
                      <Users className="w-5 h-5 text-rose-400" /> Partner 2
                    </h3>
                    <div className="space-y-8 font-bold">
                      <div className="flex flex-col gap-2">
                          <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Imię</span>
                          <input 
                            type="text" 
                            value={person2.name}
                            onChange={(e) => setPerson2(p => ({...p, name: e.target.value}))}
                            className="bg-white/40 border-b-2 border-slate-100/50 focus:border-black outline-none text-2xl h-12 w-full transition-all px-2 rounded-t-lg"
                            placeholder="np. Anna"
                          />
                      </div>
                      <div className="flex flex-col gap-2">
                          <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Data urodzenia (d.m.r)</span>
                          <input 
                            type="text" 
                            value={person2.dob}
                            placeholder="DD.MM.RRRR"
                            onChange={(e) => handleDobChange('p2', e.target.value)}
                            className="bg-white/40 border-b-2 border-slate-100/50 focus:border-black outline-none text-2xl h-12 w-full transition-all px-2 rounded-t-lg"
                          />
                      </div>
                      <div className="flex flex-col gap-2">
                          <span className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Wiek</span>
                          <div className="border-b-2 border-slate-100/50 text-2xl h-12 flex items-center text-slate-400 px-2">
                            {age2 > 0 ? age2 : '-'}
                          </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="mt-16 flex justify-center">
                <button
                  onClick={handleCalculate}
                  className="px-20 py-6 bg-black text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center gap-4"
                >
                  <Calculator className="w-5 h-5" />
                  {mode === 'compatibility' ? 'Oblicz kompatybilność' : 'Oblicz matrycę'}
                </button>
              </div>
            </div>

            {/* Matrix Result Section */}
            <AnimatePresence mode="wait">
              {activeMatrix && (
                <motion.div 
                  key={mode + (result.m1?.dob || '') + (result.m2?.dob || '')}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full max-w-[700px] aspect-square relative mb-12 bg-white/20 backdrop-blur-lg rounded-full p-8 shadow-inner border border-white/30">
                    <MatrixSvg 
                      data={activeMatrix} 
                      label={mode === 'compatibility' ? "Matryca Związku" : (person1.name || "Moja Matryca")}
                      isCompatibility={mode === 'compatibility'} 
                    />
                  </div>

                  {/* Results Bottom Detail */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 px-6">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 py-3">
                      <span className="font-bold text-slate-400 tracking-wider">Moc Rodowa</span>
                      <span className="text-2xl font-black font-mono text-purple-600">{activeMatrix.ancestralStrength}</span>
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-slate-100 py-3">
                      <span className="font-bold text-slate-400 tracking-wider">Kod Wewnętrznej Siły</span>
                      <span className="text-2xl font-black font-mono text-purple-600">{activeMatrix.internalPower}</span>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                       <DestinyCard 
                          label="1 Przeznaczenie"
                          subLabel="Osobiste"
                          val1={activeMatrix.sky}
                          val2={activeMatrix.earth}
                          sum={activeMatrix.personal}
                          labels={['Niebo', 'Ziemia']}
                        />
                        <DestinyCard 
                          label="2 Przeznaczenie"
                          subLabel="Społeczne"
                          val1={activeMatrix.male}
                          val2={activeMatrix.female}
                          sum={activeMatrix.social}
                          labels={['Męskie', 'Żeńskie']}
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 mb-12">
                       <DestinyMini 
                          label="3 Przeznaczenie"
                          subLabel="Duchowe"
                          val={activeMatrix.spiritual}
                        />
                        <DestinyMini 
                          label="4 Przeznaczenie"
                          subLabel="Korzyść"
                          val={activeMatrix.planetary}
                        />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Karta Zdrowia & Analysis */}
          {mode === 'single' && (
            <div className="w-full lg:w-[480px] sticky top-10">
               <div className="text-center mb-8">
                 <h2 className="text-3xl font-black text-black uppercase tracking-widest">Karta Zdrowia</h2>
               </div>
               
               <AnimatePresence mode="wait">
                 {activeMatrix && (
                   <motion.div
                      key={mode + (result.m1?.dob || '')}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/80 shadow-xl"
                   >
                      <HealthTable chakras={activeMatrix.chakras} isCompatibility={mode === 'compatibility'} />
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixSvg({ data, label, isCompatibility = false }: { data: MatrixData, label: string, isCompatibility?: boolean }) {
  const lineStroke = "#333333";
  
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
      <defs>
        <filter id="glass-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <linearGradient id="purple-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="30%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        
        <linearGradient id="red-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="30%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        
        <linearGradient id="yellow-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="blue-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        <linearGradient id="green-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="30%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <linearGradient id="white-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#34495e" />
        </marker>
        <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#e74c3c" />
        </marker>

        <path id="circle-path" d="M 250, 40 a 210,210 0 1,1 0,420 a 210,210 0 1,1 0,-420" />
      </defs>

      {/* Helper concentric circles */}
      <circle cx="250" cy="250" r="212" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      <circle cx="250" cy="250" r="150" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      
      {/* Geometry Lines */}
      <g stroke={lineStroke} strokeWidth="1.5">
        <line x1="250" y1="38" x2="250" y2="462" />
        <line x1="38" y1="250" x2="462" y2="250" />
      </g>

      {/* Matrix Squares */}
      <rect x="100" y="100" width="300" height="300" fill="none" stroke={lineStroke} strokeWidth="2" />
      <rect x="100" y="100" width="300" height="300" fill="none" stroke={lineStroke} strokeWidth="2" transform="rotate(45 250 250)" />

      {/* Diagonal Lines (Male/Female) */}
      <g strokeWidth="2.5">
        <line x1="100" y1="100" x2="388" y2="388" stroke="#34495e" markerEnd="url(#arrow-blue)" />
        <line x1="400" y1="100" x2="112" y2="388" stroke="#e74c3c" markerEnd="url(#arrow-red)" />
      </g>

      {/* Diagonal Labels */}
      <g className="font-black text-[9px] uppercase tracking-widest" fillOpacity="0.7">
        <text transform="translate(130, 130) rotate(45)" fill="#6366f1">LINIA MĘSKA</text>
        <text transform="translate(370, 130) rotate(-45)" textAnchor="end" fill="#f43f5e">LINIA ŻEŃSKA</text>
      </g>

      {/* Age labels around perimeter */}
      <g fontSize="11" className="fill-slate-400 font-black tracking-tighter">
      </g>

      {/* Main Points (Bubbles) */}
      <Point x={250} y={50} value={data.B} gradient="purple-bubble" />
      <Point x={450} y={250} value={data.C} gradient="red-bubble" />
      <Point x={250} y={450} value={data.D} gradient="red-bubble" />
      <Point x={50} y={250} value={data.A} gradient="purple-bubble" />

      {/* Ancestral Corners */}
      <Point x={100} y={100} value={data.F} gradient="white-bubble" border="#333" textColor="black" />
      <Point x={400} y={100} value={data.G} gradient="white-bubble" border="#333" textColor="black" />
      <Point x={400} y={400} value={data.H} gradient="white-bubble" border="#333" textColor="black" />
      <Point x={100} y={400} value={data.I} gradient="white-bubble" border="#333" textColor="black" />

      {/* Intermediate Sub-points (Chakra/Path Path) */}
      <Point x={250} y={110} value={reduceTo22(data.B + data.F)} gradient="white-bubble" border="#3498db" textColor="#3498db" small />
      <Point x={250} y={150} value={10} gradient="white-bubble" border="#34e7f8" textColor="#34e7f8" small />
      
      <Point x={250} y={390} value={data.love} gradient="white-bubble" border="#e67e22" textColor="#e67e22" small />
      <Point x={250} y={420} value={19} gradient="white-bubble" border="#333" textColor="#333" small />

      <Point x={110} y={250} value={reduceTo22(data.A + data.I)} gradient="white-bubble" border="#3498db" textColor="#3498db" small />
      <Point x={150} y={250} value={15} gradient="white-bubble" border="#34e7f8" textColor="#34e7f8" small />

      <Point x={390} y={250} value={data.money} gradient="white-bubble" border="#f39c12" textColor="#f39c12" small />

      {/* Inner Mastery Point */}
      <Point x={250} y={195} value={15} gradient="white-bubble" border="#27ae60" textColor="#27ae60" small />

      {/* Symbols */}
      <g transform="translate(325, 275) scale(1.1)" className="drop-shadow-lg">
        <DollarSign className="stroke-green-500 stroke-[3px]" />
      </g>
      <g transform="translate(275, 305) scale(1.2)" className="drop-shadow-lg">
        <Heart className="fill-red-500 stroke-red-600 stroke-[1px]" />
      </g>

      {/* Center Zone Bubble */}
      <g>
        <circle cx="250" cy="250" r="44" fill="url(#yellow-bubble)" filter="url(#glass-shadow)" />
        <circle cx="250" cy="250" r="44" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="240" cy="230" rx="20" ry="10" fill="white" fillOpacity="0.4" transform={`rotate(-10 250 250)`} />
        <text 
          x="250" y="262" 
          textAnchor="middle" 
          className="fill-slate-900 font-black text-4xl select-none"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {data.E}
        </text>
      </g>

      <text x="250" y="15" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">{label}</text>
    </svg>
  );
}

function Point({ x, y, value, color, gradient, border, small = false, textColor = "white" }: any) {
  const radius = small ? 14 : 28; // Increased size slightly for premium feel
  
  return (
    <g filter="url(#glass-shadow)" className="transition-transform duration-500 hover:scale-110 cursor-default origin-center">
      <circle 
        cx={x} cy={y} 
        r={radius} 
        fill={gradient ? `url(#${gradient})` : color}
        stroke={border || "white"}
        strokeWidth={border ? 3 : 1}
        strokeOpacity={border ? 1 : 0.4}
      />
      
      {/* Specular Highlights for Liquid Glass Effect */}
      <ellipse cx={x - radius * 0.35} cy={Number(y) - radius * 0.45} rx={radius * 0.45} ry={radius * 0.28} fill="white" fillOpacity="0.6" transform={`rotate(-15 ${x} ${y})`} />
      <circle cx={x + radius * 0.45} cy={Number(y) - radius * 0.3} r={radius * 0.18} fill="white" fillOpacity="0.4" />
      
      {/* Bottom Reflection */}
      <path d={`M ${x - radius * 0.6} ${Number(y) + radius * 0.45} Q ${x} ${Number(y) + radius * 0.7} ${x + radius * 0.6} ${Number(y) + radius * 0.45}`} fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.15" strokeLinecap="round" />
      
      {/* Inner Depth Glow */}
      <circle cx={x} cy={y} r={radius - 2} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.1" />
      
      <text 
        x={x} y={Number(y) + (small ? 6 : 10)} 
        textAnchor="middle" 
        className="font-black select-none pointer-events-none"
        fill={textColor}
        style={{ 
          fontSize: (radius * 0.9) + 'px', 
          textShadow: textColor === 'white' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 1px rgba(255,255,255,0.5)' 
        }}
      >
        {value}
      </text>
    </g>
  );
}

function DestinyCard({ label, subLabel, val1, val2, sum, labels }: any) {
  return (
    <div className="flex flex-col items-center bg-white p-10 rounded-[3rem] border border-white shadow-sm hover:shadow-md transition-all group">
      <div className="text-center mb-8">
        <p className="font-black text-[10px] tracking-widest uppercase text-slate-400 mb-2">{label}</p>
        <p className="text-base font-bold text-black">{subLabel}</p>
      </div>
      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-6 font-bold">
           <div className="flex items-center gap-4">
              <span className="w-5 text-slate-300 font-black text-xs">{labels[0]}</span>
              <div className="w-14 h-14 rounded-full border-2 border-slate-50 flex items-center justify-center text-xl bg-slate-50 shadow-inner text-black">{val1}</div>
           </div>
           <div className="flex items-center gap-4">
              <span className="w-5 text-slate-300 font-black text-xs">{labels[1]}</span>
              <div className="w-14 h-14 rounded-full border-2 border-slate-50 flex items-center justify-center text-xl bg-slate-50 shadow-inner text-black">{val2}</div>
           </div>
        </div>
        <div className="w-px h-24 bg-slate-100 relative mx-2">
           <div className="absolute top-1/2 -right-4 w-4 h-px bg-slate-100" />
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center font-black text-3xl bg-white shadow-xl text-black">
          {sum}
        </div>
      </div>
    </div>
  );
}

function DestinyMini({ label, subLabel, val }: any) {
  return (
    <div className="flex-1 flex items-center justify-between border border-white p-10 rounded-[3rem] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div>
        <p className="font-black text-[10px] tracking-widest uppercase text-slate-400 mb-2">{label}</p>
        <p className="text-lg font-black text-slate-800 leading-tight">{subLabel}</p>
      </div>
      <div className="w-16 h-16 rounded-full border-2 border-slate-100 group-hover:border-purple-500 transition-colors flex items-center justify-center font-black text-2xl bg-white shadow-xl text-purple-600">
        {val}
      </div>
    </div>
  );
}

function HealthTable({ chakras, isCompatibility = false }: { chakras: any[], isCompatibility?: boolean }) {
  const totals = useMemo(() => {
    return chakras.reduce((acc, c) => ({
      physics: acc.physics + c.physics,
      energy: acc.energy + c.energy,
      emotion: acc.emotion + c.emotion
    }), { physics: 0, energy: 0, emotion: 0 });
  }, [chakras]);

  const CHAKRA_INFO = [
    { name: "SAHASRARA (misja)", desc: "Włosy, mózg, góra czaszki", color: "#a855f7" },
    { name: "AJNA (los, intuicja)", desc: "Oczy, dół czaszki, nerwy", color: "#6366f1" },
    { name: "VISHUDDHA (ekspresja)", desc: "Gardło, tarczyca, ramiona", color: "#0ea5e9" },
    { name: "ANAHATA (relacje)", desc: "Serce, płuca, klatka piersiowa", color: "#10b981" },
    { name: "MANIPURA (status)", desc: "Kręgosłup, trawienie, wątroba", color: "#facc15" },
    { name: "SVADHISTANA (radość)", desc: "Nerki, jelita, genitalia", color: "#f97316" },
    { name: "MULADHARA (materia)", desc: "Nogi, układ moczowy, ciało", color: "#ef4444" }
  ];

  const titlePrefix = isCompatibility ? "ZWIĄZEK: " : "";

  return (
    <div className="w-full text-xs font-bold font-mono border border-slate-100/50 rounded-2xl overflow-hidden">
       <div className="flex bg-slate-50/50 text-slate-400 h-16 divide-x divide-slate-100/50 uppercase">
          <div className="w-[70px] flex items-center justify-center text-center px-1 font-black">Fizyka</div>
          <div className="w-[70px] flex items-center justify-center text-center px-1 font-black">Energia</div>
          <div className="w-[70px] flex items-center justify-center text-center px-1 font-black">Emocja</div>
          <div className="flex-1 flex items-center justify-center text-center px-1 text-[10px] uppercase font-black tracking-tighter">Czakra</div>
       </div>

       {chakras.map((c, i) => (
         <div key={i} className="flex h-20 divide-x border-b border-slate-50/50 group hover:bg-slate-50/30 transition-colors">
            <div className="w-[70px] flex items-center justify-center text-2xl text-black">{c.physics}</div>
            <div className="w-[70px] flex items-center justify-center text-2xl text-black">{c.energy}</div>
            <div className="w-[70px] flex items-center justify-center text-2xl text-black bg-white/20">{c.emotion}</div>
            <div className="flex-1 bg-white/50 px-4 font-sans text-[10px] leading-snug flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                   <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: CHAKRA_INFO[i].color }} />
                   <strong className="text-black font-black uppercase tracking-wider">{titlePrefix}{CHAKRA_INFO[i].name}</strong>
                </div>
                <span className="text-slate-400 font-medium">{CHAKRA_INFO[i].desc}</span>
            </div>
         </div>
       ))}

       <div className="flex bg-black text-white h-16 divide-x divide-white/10 uppercase">
          <div className="w-[70px] flex items-center justify-center text-2xl font-black">{reduceTo22(totals.physics)}</div>
          <div className="w-[70px] flex items-center justify-center text-2xl font-black">{reduceTo22(totals.energy)}</div>
          <div className="w-[70px] flex items-center justify-center text-2xl font-black">{reduceTo22(totals.emotion)}</div>
          <div className="flex-1 flex items-center justify-center text-xl tracking-widest pl-4 font-black">RAZEM</div>
       </div>
    </div>
  );
}


