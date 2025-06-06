import mongoose from 'mongoose';

const MeasureSchema = new mongoose.Schema({
  user: {
    name: String,
    email: String,
  },
  rawData: { type: [Object], required: true },
  summaryData: { type: [Object], required: true },
}, { timestamps: true });

// Prevent model overwrite during development
export default mongoose.models.MeasureData || mongoose.model('MeasureData', MeasureSchema, 'MeasureData');
