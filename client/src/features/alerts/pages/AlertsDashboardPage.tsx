import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { getAlerts } from '../../../api/alertsApi';
import { Alert } from '../../../types/api';
import AlertList from '../components/AlertList';

export default function AlertsDashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => setAlerts([]));
  }, []);

  return (
    <MainLayout>
      <h2>Alerts</h2>
      <AlertList alerts={alerts} />
    </MainLayout>
  );
}
