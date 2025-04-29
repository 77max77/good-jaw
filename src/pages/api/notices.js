// app/api/notices/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../database/dbconnect";
import Notice from "../../../database/model/Notice";;


export default async function handler(req, res) {
  if (req.method === "GET") {
    // ?limit=2 처럼 limit 파라미터로 불러올 건수 제한 가능
    const { limit } = req.query;
    try {
      await dbConnect();
      let query = Notice.find().sort({ createdAt: -1 });
      const lim = parseInt(limit, 10);
      if (!isNaN(lim) && lim > 0) {
        query = query.limit(lim);
      }
      const docs = await query.lean();
      const payload = docs.map((doc) => ({
        id:      doc._id.toString(),
        title:   doc.title,
        author:  doc.author,
        views:   doc.views,
        date:    doc.createdAt.toISOString().slice(0, 10),
      }));
      return res.status(200).json(payload);
    } catch (error) {
      console.error("GET /api/notices error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "POST") {
    const { title, content } = req.body;
    try {
      await dbConnect();
      const newNotice = await Notice.create({ title, content });
      return res.status(201).json({
        id:      newNotice._id.toString(),
        title:   newNotice.title,
        author:  newNotice.author,
        views:   newNotice.views,
        date:    newNotice.createdAt.toISOString().slice(0, 10),
      });
    } catch (error) {
      console.error("POST /api/notices error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // 그 외 메서드는 허용하지 않음
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}