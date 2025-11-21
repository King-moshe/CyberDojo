import { Request, Response } from 'express';
import * as alertsService from '../services/alerts.service';
import { emitAlert, onAlert } from '../utils/alertEvents';
import logger from '../config/logger';

/**
 * GET /api/alerts
 */
export const listAlerts = async (req: Request, res: Response) => {
  try {
    const { status, severity, scenarioId, runId, page, limit } = req.query;
    const filter: any = {};
    if (status) filter.status = String(status);
    if (severity) filter.severity = String(severity);
    if (scenarioId) filter.scenarioId = String(scenarioId);
    if (runId) filter.runId = String(runId);
    if (page) filter.page = Number(page);
    if (limit) filter.limit = Number(limit);

    const result = await alertsService.listAlerts(filter);
    res.json({ data: result });
  } catch (err) {
    console.error('listAlerts error', err);
    res.status(500).json({ error: 'Failed to list alerts' });
  }
};

/**
 * GET /api/alerts/:id
 */
export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await alertsService.getAlertById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ data: alert });
  } catch (err) {
    console.error('getAlertById error', err);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
};

/**
 * PATCH /api/alerts/:id/resolve
 */
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await alertsService.resolveAlert(id);
    if (!updated) return res.status(404).json({ error: 'Alert not found' });
    // emit resolved alert event for SSE consumers
    try { emitAlert(updated); } catch (_) {}
    res.json({ data: updated });
  } catch (err) {
    console.error('resolveAlert error', err);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

/**
 * GET /api/alerts/stream (SSE)
 */
export const stream = async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // send a ping/comment so clients know we're connected
    res.write(': connected\n\n');

    // send recent alerts (latest first)
    try {
      const recent = await alertsService.listAlerts({ page: 1, limit: 20 } as any);
      if (recent && Array.isArray((recent as any).results)) {
        for (const a of (recent as any).results) {
          try {
            res.write('event: alert\n');
            res.write(`data: ${JSON.stringify(a)}\n\n`);
          } catch (err) {
            logger.error('Failed to write recent alert to SSE', err);
          }
        }
      }
    } catch (err) {
      logger.error('Failed to load recent alerts for SSE', err);
    }

    // subscribe to future alerts
    const unsubscribe = onAlert((alert) => {
      try {
        res.write('event: alert\n');
        res.write(`data: ${JSON.stringify(alert)}\n\n`);
      } catch (err) {
        logger.error('Failed to send alert via SSE', err);
      }
    });

    const cleanUp = () => {
      try { unsubscribe(); } catch (e) { /* noop */ }
      try { res.end(); } catch (e) { /* noop */ }
    };

    // close on client disconnect
    req.on('close', () => {
      logger.info('SSE client disconnected from /api/alerts/stream');
      cleanUp();
    });
  } catch (err) {
    logger.error('SSE stream error', err);
    try { res.end(); } catch (e) { /* noop */ }
  }
};

export default { listAlerts, getAlertById, resolveAlert, stream };
