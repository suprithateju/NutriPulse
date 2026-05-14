"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChevronLeft, Utensils, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Recommendations() {
  const { ageGroup, dietaryPref } = useStore();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/recommendations/meals?age_group=${ageGroup || 'adult'}&pref=${dietaryPref || 'veg'}`);
        setMeals(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [ageGroup, dietaryPref]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Utensils className="text-amber-400" size={32} />
          Meal Recommendations
        </h1>
        <p className="text-slate-400 mb-12">Personalized Indian meals tailored for your age group and nutrient gaps.</p>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Curating your meals...</div>
        ) : (
          <div className="space-y-6">
            {meals.map((meal, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-amber-500/30 transition-colors group"
              >
                <div>
                  <div className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">{meal.type}</div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">{meal.name}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-400 font-medium">{meal.calories} kcal</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400 font-medium">{meal.focus}</span>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 px-5 py-3 rounded-xl transition-all font-semibold md:w-auto w-full justify-center">
                  <PlusCircle size={18} /> Add to Diary
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
