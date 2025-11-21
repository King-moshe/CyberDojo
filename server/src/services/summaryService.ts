import ScenarioModel from '../models/Scenario';
import RunModel from '../models/Run';
import AlertModel from '../models/Alert';

export async function getSummary() {
  const scenariosCount = await ScenarioModel.countDocuments();

  const pending = await RunModel.countDocuments({ status: 'pending' });
  const running = await RunModel.countDocuments({ status: 'running' });
  const completed = await RunModel.countDocuments({ status: 'completed' });
  const failed = await RunModel.countDocuments({ status: 'failed' });

  const low = await AlertModel.countDocuments({ severity: 'low' });
  const medium = await AlertModel.countDocuments({ severity: 'medium' });
  const high = await AlertModel.countDocuments({ severity: 'high' });

  return {
    scenariosCount,
    runs: { pending, running, completed, failed },
    alerts: { low, medium, high },
  };
}

export default { getSummary };
