// src/pages/api/analysis/latest.js

import dbConnect from "../../../../database/dbconnect";
// 저장할 때 쓰신 MeasureData 스키마를 그대로 import
import MeasureData from "../../../../database/model/MeasureData";

export default async function handler(req, res) {
  const { method, query: { email } } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
  if (!email) {
    return res.status(400).json({ error: 'Missing email query parameter' });
  }

  try {
    await dbConnect();

    // user.email 로 검색
    const doc = await MeasureData
      .findOne({ 'user.email': email })
      .sort({ createdAt: -1 })
      .lean();

    if (!doc) {
      return res.status(404).json({ error: 'No analysis data found for this email' });
    }

    // rawData, summaryData 필드를 그대로 넘겨줍니다.
    return res.status(200).json({
      graphData:  doc.rawData,
      infoData:   doc.summaryData,
    });
  } catch (err) {
    console.error('[/api/analysis/latest] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
