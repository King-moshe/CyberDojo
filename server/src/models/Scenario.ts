import mongoose, { Schema, Document } from 'mongoose';

export interface IScenario extends Document {
  name: string;
  description?: string;
  steps?: unknown[];
  createdAt?: Date;
}

const ScenarioSchema: Schema = new Schema<IScenario>(
  {
    name: { type: String, required: true },
    description: { type: String },
    steps: { type: Array, default: [] },
  },
  { timestamps: true }
);

// Add an index on `name` to speed up lookups/searches
ScenarioSchema.index({ name: 1 });

const ScenarioModel = mongoose.model<IScenario>('Scenario', ScenarioSchema);
export default ScenarioModel;
