import { create } from "zustand";

interface UIStore {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
  selectedUniversityId: string | null;
  setSelectedUniversityId: (id: string | null) => void;
  addUniversityOpen: boolean;
  setAddUniversityOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  shortcutsOpen: false,
  setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
  selectedUniversityId: null,
  setSelectedUniversityId: (id) => set({ selectedUniversityId: id }),
  addUniversityOpen: false,
  setAddUniversityOpen: (v) => set({ addUniversityOpen: v }),
}));
