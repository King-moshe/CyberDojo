import mongoose, { Schema, Document } from 'mongoose';

export interface IRun extends Document {
  scenario: mongoose.Types.ObjectId;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  endedAt?: Date;
  logs?: string[];
}

const RunSchema: Schema = new Schema<IRun>(
  {
    scenario: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    status: { type: String, default: 'pending' },
    startedAt: { type: Date },
    endedAt: { type: Date },
    logs: { type: [String], default: [] },
  },
  { timestamps: true }
);

const RunModel = mongoose.model<IRun>('Run', RunSchema);
export default RunModel;
