import create from 'zustand';
import { Run } from '../types/api';

type State = {
  runs: Run[];
  setRuns: (r: Run[]) => void;
};

export const useRunsStore = create<State>((set) => ({
  runs: [],
  setRuns: (r) => set({ runs: r }),
}));

export default useRunsStore;
