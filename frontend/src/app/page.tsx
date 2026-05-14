"use client";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function LandingPage() {
  const router = useRouter();
  const setAgeGroup = useStore((state) => state.setAgeGroup);

  const handleSelect = (group: 'child' | 'adult' | 'old_age') => {
    setAgeGroup(group);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-7xl font-extrabold bg-gradient-to-br from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-6 pb-2">
          NutriPulse
        </h1>
        <p className="text-2xl text-slate-400 max-w-2xl font-light">
          Your intelligent nutrition companion tailored for Indian diets.
          Select an age group to personalize your experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <AgeCard
          title="Child (2-12)"
          emoji="👶"
          desc="Growth-focused, calcium & iron rich targets."
          onClick={() => handleSelect('child')}
          delay={0.1}
        />
        <AgeCard
          title="Adult (13-59)"
          emoji="🧑"
          desc="Metabolic-focused, protein & B12 optimized."
          onClick={() => handleSelect('adult')}
          delay={0.3}
        />
        <AgeCard
          title="Old Age (60+)"
          emoji="👴"
          desc="Bone & muscle focused, soft texture aware."
          onClick={() => handleSelect('old_age')}
          delay={0.5}
        />
      </div>
    </div>
  );
}

function AgeCard({ title, emoji, desc, onClick, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl cursor-pointer hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all group"
    >
      <div className="text-7xl mb-6">{emoji}</div>
      <h3 className="text-2xl font-bold mb-3 text-slate-100 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
