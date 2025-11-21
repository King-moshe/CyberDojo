import mongoose, { Schema, Document } from 'mongoose';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'resolved';

export interface IAlert extends Document {
  scenario: mongoose.Types.ObjectId;
  run: mongoose.Types.ObjectId;
  type: string;
  severity: AlertSeverity;
  message: string;
  details?: any;
  status: AlertStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const AlertSchema: Schema = new Schema<IAlert>(
  {
    scenario: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    run: { type: Schema.Types.ObjectId, ref: 'Run', required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

AlertSchema.index({ status: 1, severity: 1, scenario: 1, run: 1 });

const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);
export default AlertModel;
