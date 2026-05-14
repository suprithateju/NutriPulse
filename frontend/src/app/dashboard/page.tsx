"use client";
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, Apple, Camera, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const { name, ageGroup, dietaryPref, userId } = useStore();
  const [consumed, setConsumed] = useState(0);

  useEffect(() => {
    if (!name || !ageGroup) {
      router.push('/');
    }
    
    const fetchToday = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/diary/week?user_id=${userId || 1}`);
        const todayData = res.data.find((d: any) => {
           const dbDate = new Date(d.date);
           const now = new Date();
           return dbDate.getDate() === now.getDate() && dbDate.getMonth() === now.getMonth() && dbDate.getFullYear() === now.getFullYear();
        });
        if (todayData) {
          setConsumed(todayData.calories);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (userId) fetchToday();
  }, [name, ageGroup, router, userId]);

  // Age group specific targets
  const getTargets = () => {
    if (ageGroup === 'child') return { cal: 1600, protein: '40g', topNutrient: 'Calcium' };
    if (ageGroup === 'adult') return { cal: 2200, protein: '60g', topNutrient: 'B12' };
    return { cal: 1800, protein: '50g', topNutrient: 'Bone Density' };
  };

  const targets = getTargets();

  const calData = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: Math.max(0, targets.cal - consumed) },
  ];
  const COLORS = ['#10b981', '#1e293b'];

  if (!name) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 overflow-x-hidden">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Hello, {name}
          </h1>
          <p className="text-slate-400 capitalize mt-1">
            {ageGroup.replace('_', ' ')} • {dietaryPref} Diet
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
          {name.charAt(0)}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calorie Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl relative"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Activity className="text-emerald-400" /> Today's Calories</h2>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {calData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">{consumed}</span>
              <span className="text-sm text-slate-400">/ {targets.cal} kcal</span>
            </div>
          </div>
        </motion.div>

        {/* Action Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="Plate Analyser"
            desc="Snap a meal to get calories instantly."
            icon={<Camera size={28} />}
            href="/log-meal"
            delay={0.1}
            color="from-blue-500/20 to-cyan-500/20"
            textColor="text-cyan-400"
          />
          <ActionCard
            title="Deficiency Predictor"
            desc="Take the test to find nutrient gaps."
            icon={<AlertTriangle size={28} />}
            href="/deficiency"
            delay={0.2}
            color="from-rose-500/20 to-orange-500/20"
            textColor="text-rose-400"
          />
          <ActionCard
            title="Meal Diary"
            desc="Review your 7-day food logs."
            icon={<Apple size={28} />}
            href="/diary"
            delay={0.3}
            color="from-emerald-500/20 to-teal-500/20"
            textColor="text-emerald-400"
          />
          <ActionCard
            title="Nutrient Dashboard"
            desc="Check your macro/micro targets."
            icon={<Activity size={28} />}
            href="/nutrients"
            delay={0.4}
            color="from-purple-500/20 to-fuchsia-500/20"
            textColor="text-fuchsia-400"
          />
          <ActionCard
            title="Recommendations"
            desc="Meals tailored to your deficiencies."
            icon={<Apple size={28} />}
            href="/recommendations"
            delay={0.5}
            color="from-amber-500/20 to-yellow-500/20"
            textColor="text-amber-400"
          />
          
          {/* Smart Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 rounded-2xl flex items-start gap-4"
          >
            <div className="bg-amber-500/20 p-3 rounded-xl text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400 mb-1">Smart Alert</h3>
              <p className="text-slate-300 text-sm">
                You're low on {targets.topNutrient} today. Consider adding {ageGroup === 'child' ? 'Milk or Ragi' : 'fortified foods'} to your next meal.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ title, desc, icon, href, delay, color, textColor }: any) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02 }}
        className={`bg-slate-900 border border-slate-800 p-6 rounded-3xl h-full flex flex-col group cursor-pointer hover:border-slate-700 transition-colors`}
      >
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} ${textColor} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow">{desc}</p>
        <div className="mt-4 flex items-center text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
          Open <ChevronRight size={16} className="ml-1" />
        </div>
      </motion.div>
    </Link>
  );
}
