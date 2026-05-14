"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Onboarding() {
  const router = useRouter();
  const { ageGroup, name, setName, dietaryPref, setDietaryPref, setUserId } = useStore();
  const [localName, setLocalName] = useState(name || '');
  const [pref, setPref] = useState<'veg' | 'non-veg' | null>(dietaryPref);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName || !pref) return;
    
    setName(localName);
    setDietaryPref(pref);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/profile/setup', {
        name: localName,
        age_group: ageGroup || 'adult',
        dietary_pref: pref
      });
      setUserId(res.data.user_id);
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <h2 className="text-3xl font-bold mb-2">Welcome to NutriPulse</h2>
        <p className="text-slate-400 mb-8">
          You selected <span className="text-emerald-400 capitalize">{ageGroup?.replace('_', ' ')}</span>. Let's personalize your plan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">What is your name?</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="e.g. Rahul"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Dietary Preference</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPref('veg')}
                className={`py-3 px-4 rounded-xl border transition-all ${
                  pref === 'veg'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                🥬 Vegetarian
              </button>
              <button
                type="button"
                onClick={() => setPref('non-veg')}
                className={`py-3 px-4 rounded-xl border transition-all ${
                  pref === 'non-veg'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                🍗 Non-Veg
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!localName || !pref}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Continue to Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}
