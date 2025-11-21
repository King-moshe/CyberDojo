import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import ScenarioForm from '../components/ScenarioForm';
import { createScenario } from '../../../api/scenariosApi';

export default function NewScenarioPage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload: any) => {
    const created = await createScenario(payload);
    const id = created?._id || created?.id;
    if (id) navigate(`/scenarios/${id}`);
    else navigate('/scenarios');
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 920 }}>
        <h2>New Scenario</h2>
        <ScenarioForm onSubmit={handleSubmit} submitLabel="Create" />
      </div>
    </MainLayout>
  );
}
