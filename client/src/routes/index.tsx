import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScenariosListPage from '../features/scenarios/pages/ScenariosListPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ScenarioDetailsPage from '../features/scenarios/pages/ScenarioDetailsPage';
import ScenarioBuilderPage from '../features/scenarios/pages/ScenarioBuilderPage';
import RunsHistoryPage from '../features/runs/pages/RunsHistoryPage';
import RunDetailsPage from '../features/runs/pages/RunDetailsPage';
import AlertsListPage from '../features/alerts/pages/AlertsListPage';
import AlertDetailsPage from '../features/alerts/pages/AlertDetailsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/scenarios" element={<ScenariosListPage />} />
      <Route path="/scenarios/new" element={<ScenarioBuilderPage />} />
      <Route path="/scenarios/:id/edit" element={<ScenarioBuilderPage />} />
      <Route path="/scenarios/:id" element={<ScenarioDetailsPage />} />
      <Route path="/runs" element={<RunsHistoryPage />} />
      <Route path="/runs/:id" element={<RunDetailsPage />} />
      <Route path="/alerts" element={<AlertsListPage />} />
      <Route path="/alerts/:id" element={<AlertDetailsPage />} />
    </Routes>
  );
}
