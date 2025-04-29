// src/models/Notice.js
import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  author:    { type: String, default: "관리자" },
  views:     { type: Number, default: 0 },
  createdAt: { type: Date,   default: Date.now }
});

export default mongoose.models.Notice ||
  mongoose.model("Notice", NoticeSchema);
