"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { AlertTriangle, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const SYMPTOMS = [
  "Fatigue or low energy",
  "Hair fall",
  "Joint or bone pain",
  "Muscle cramps",
  "Frequent mouth ulcers",
  "Pale skin",
  "Brain fog or poor focus",
  "Tingling in hands/feet"
];

export default function DeficiencyPredictor() {
  const { ageGroup } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleSymptom = (sym: string) => {
    setSelected(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/deficiency/predict', {
        symptoms: selected,
        age_group: ageGroup || 'adult'
      });
      setResult(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
            Deficiency Predictor
          </h1>
          <p className="text-slate-400 mb-8">
            Select any symptoms you've been experiencing. Our AI will analyze them against your age group profile to predict potential nutrient gaps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {SYMPTOMS.map((sym) => (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  selected.includes(sym)
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          <button
            onClick={handlePredict}
            disabled={selected.length === 0 || loading}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Analyze Symptoms'}
          </button>
        </div>

        <div>
          {result ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Prediction Results</h3>
                  <p className="text-sm text-slate-400">Adjusted for <span className="capitalize">{ageGroup?.replace('_', ' ')}</span> profile</p>
                </div>
              </div>

              <div className="space-y-6">
                {result.top_risks.map((risk: any, i: number) => (
                  <div key={i} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-lg text-rose-400 flex items-center gap-2">
                        <AlertTriangle size={18} /> {risk.nutrient} Risk
                      </span>
                      <span className="text-sm bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full">
                        {Math.round(risk.risk_score * 100)}% Match
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${risk.risk_score * 100}%` }} />
                    </div>
                    <div className="text-sm text-slate-300">
                      <strong className="text-slate-500 block mb-1">Recommended Foods:</strong>
                      {risk.recommendations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center min-h-[400px]">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Select symptoms and run analysis to see predictive insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
