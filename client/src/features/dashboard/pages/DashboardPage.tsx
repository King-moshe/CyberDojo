import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import useSummary from "../../../hooks/useSummary";
import StatCard from "../components/StatCard";
import PieChartJS from "../components/PieChartJS";
import BarChartJS from "../components/BarChartJS";
import ConsolidatedTable from "../components/ConsolidatedTable";
import {
  countByStatusRuns,
  countBySeverityAlerts,
  scenariosSummary,
} from "../utils/aggregates";

export default function DashboardPage() {
  const { summary, loading, error } = useSummary();

  const scenarios: any[] = summary?.scenariosCount !== undefined ? [] : [];
  const runs: any[] = [];
  const alerts: any[] = [];

  console.log("Summary data:", summary);

  // Use summary.data for all counts
  const summaryData = summary?.data || {};

  const runsByStatus: Record<string, number> = Object.fromEntries(
    Object.entries(summaryData.runs || {}).map(([k, v]) => [k, Number(v || 0)])
  );
  const alertsBySeverity: Record<string, number> = Object.fromEntries(
    Object.entries(summaryData.alerts || {}).map(([k, v]) => [
      k,
      Number(v || 0),
    ])
  );

  const pieDataRuns = useMemo(
    () =>
      Object.entries(runsByStatus).map(([k, v]) => ({
        label: k,
        value: Number(v),
      })),
    [runsByStatus]
  );
  const pieDataAlerts = useMemo(
    () =>
      Object.entries(alertsBySeverity).map(([k, v]) => ({
        label: k,
        value: Number(v),
      })),
    [alertsBySeverity]
  );

  const scenarioStats = { total: summaryData.scenariosCount || 0 };

  // small bar sample: runs per status (value)
  const barData = Object.entries(runsByStatus || {}).map(([k, v]) => ({
    label: k,
    value: v,
  }));

  // Prepare tableRows for ConsolidatedTable
  const tableRows: any[] = summaryData.recentRuns
    ? summaryData.recentRuns.map((run: any, idx: number) => ({
        id: run.id || idx,
        name: run.name || `Run ${idx + 1}`,
        status: run.status || "Unknown",
        date: run.date || "",
        // Add other fields as needed for your table
      }))
    : [];

  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <div className="muted">Overview of scenarios, runs and alerts</div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 24,
        }}
      >
        <StatCard
          title="Scenarios"
          value={scenarioStats.total}
          hint="Total scenarios"
        />
        <StatCard
          title="Runs"
          value={Object.values(runsByStatus || {}).reduce(
            (s: number, v: any) => s + Number(v || 0),
            0
          )}
          hint="Total runs"
        />
        <StatCard
          title="Alerts"
          value={Object.values(alertsBySeverity || {}).reduce(
            (s: number, v: any) => s + Number(v || 0),
            0
          )}
          hint="Total alerts"
        />
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Runs by Status</div>
          <PieChartJS data={pieDataRuns} size={120} />
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, margin: "18px 0 8px" }}>
            Runs Status Bar
          </div>
          <BarChartJS data={barData} width={300} height={120} />
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Alerts by Severity
          </div>
          <div className="card" style={{ padding: 12 }}>
            <PieChartJS data={pieDataAlerts} size={200} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div>
          <div style={{ marginBottom: 12 }} className="muted">
            Recent runs
          </div>
          {loading && <div>Loading summary…</div>}
          {error && <div className="muted">Failed to load summary.</div>}
          {!loading && !error && <ConsolidatedTable rows={tableRows} />}
        </div>
      </div>
    </MainLayout>
  );
}
