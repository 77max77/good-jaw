import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  array1: { type: [[Number]], required: true },
  array2: { type: [[Number]], required: true },
  array3: { type: [[Number]], required: true },
  content: { type: String, required: true },
  maxHeight: { type: Number, required: true },
  maxWidth: { type: Number, required: true },
}, { timestamps: true });

// Prevent model overwrite during development
export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema, 'Analysis');
