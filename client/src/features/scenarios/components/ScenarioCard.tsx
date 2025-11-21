import React, { useState } from 'react';
import { Scenario } from '../../../types/api';
import ScenarioPreview from './ScenarioPreview';
import { useNavigate } from 'react-router-dom';

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="card scenario-card" onClick={() => navigate(`/scenarios/${scenario._id || scenario.id}`)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 className="scenario-title">{scenario.name}</h4>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(scenario.steps || []).length} steps</div>
        </div>
        <p className="scenario-desc">{scenario.description}</p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}>Preview</button>
        </div>
      </div>
      {previewOpen && <ScenarioPreview scenario={scenario} onClose={() => setPreviewOpen(false)} />}
    </>
  );
}
