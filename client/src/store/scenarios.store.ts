import create from 'zustand';
import { Scenario } from '../types/api';

type State = {
  scenarios: Scenario[];
  setScenarios: (s: Scenario[]) => void;
};

export const useScenariosStore = create<State>((set) => ({
  scenarios: [],
  setScenarios: (s) => set({ scenarios: s }),
}));

export default useScenariosStore;
