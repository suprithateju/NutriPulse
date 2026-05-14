import { create } from 'zustand';

interface UserState {
  userId: number | null;
  ageGroup: 'child' | 'adult' | 'old_age' | null;
  dietaryPref: 'veg' | 'non-veg' | null;
  name: string;
  setUserId: (id: number) => void;
  setAgeGroup: (group: 'child' | 'adult' | 'old_age') => void;
  setDietaryPref: (pref: 'veg' | 'non-veg') => void;
  setName: (name: string) => void;
}

export const useStore = create<UserState>((set) => ({
  userId: null,
  ageGroup: null,
  dietaryPref: null,
  name: '',
  setUserId: (id) => set({ userId: id }),
  setAgeGroup: (group) => set({ ageGroup: group }),
  setDietaryPref: (pref) => set({ dietaryPref: pref }),
  setName: (name) => set({ name }),
}));
