import create from 'zustand';
import { Alert } from '../types/api';

type State = {
  alerts: Alert[];
  setAlerts: (a: Alert[]) => void;
};

export const useAlertsStore = create<State>((set) => ({
  alerts: [],
  setAlerts: (a) => set({ alerts: a }),
}));

export default useAlertsStore;
