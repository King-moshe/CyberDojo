import { useState } from 'react';
import { runScenario } from '../api/scenariosApi';

export default function useScenarioRun() {
  const [running, setRunning] = useState(false);

  const start = async (id: string) => {
    setRunning(true);
    try {
      const res = await runScenario(id);
      return res;
    } finally {
      setRunning(false);
    }
  };

  return { running, start };
}
