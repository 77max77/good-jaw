// src/pages/api/get-nose.js
import dbConnect from "../../../database/dbconnect";
import User from "../../../database/model/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "이메일이 필요합니다." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }

  return res.status(200).json({
    name: user.name,
    email: user.email,
    noseLength: user.noseLength || null,
  });
}
