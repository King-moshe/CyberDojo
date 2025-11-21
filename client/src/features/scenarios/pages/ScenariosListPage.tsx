import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { getScenarios } from '../../../api/scenariosApi';
import { Scenario } from '../../../types/api';
import ScenarioCard from '../components/ScenarioCard';
import { useNavigate } from 'react-router-dom';

export default function ScenariosListPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<Scenario[]>([]);

  useEffect(() => {
    getScenarios().then(setScenarios).catch(() => setScenarios([]));
  }, []);

  // keep filtered in sync with original data
  useEffect(() => {
    setFiltered(scenarios);
  }, [scenarios]);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = (query || '').trim().toLowerCase();
      if (!q) {
        setFiltered(scenarios);
        return;
      }
      setFiltered(
        scenarios.filter((s) => {
          const name = (s.name || '').toLowerCase();
          const desc = (s.description || '').toLowerCase();
          return name.includes(q) || desc.includes(q);
        })
      );
    }, 300);

    return () => clearTimeout(handler);
  }, [query, scenarios]);

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Scenarios</h2>
          <div className="muted">Create and run attack scenarios for training</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="search" placeholder="Search scenarios..." />
          <button className="btn btn-primary" onClick={() => navigate('/scenarios/new')}>New Scenario</button>
        </div>
      </div>

      <div className="scenarios-grid">
        {scenarios.map((s) => (
          <ScenarioCard key={s._id || s.id} scenario={s} />
        ))}
      </div>
    </MainLayout>
  );
}
