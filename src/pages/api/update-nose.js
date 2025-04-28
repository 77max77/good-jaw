// src/pages/api/update-nose.js
import dbConnect from "../../../database/dbconnect";
import User from "../../../database/model/User";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) DB 연결
  await dbConnect();

  // 2) Body에서 이메일·코길이 추출
  const { email, noseLength } = req.body;
  if (!email) {
    return res.status(400).json({ message: "이메일이 필요합니다." });
  }
  const num = parseFloat(noseLength);
  if (isNaN(num) || num <= 0) {
    return res.status(400).json({ message: "유효한 코 길이를 입력해주세요." });
  }

  // 3) 해당 이메일 사용자를 찾아 업데이트
  const user = await User.findOneAndUpdate(
    { email },
    { noseLength: num },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }

  // 4) 성공 응답
  return res
    .status(200)
    .json({ message: "코 길이가 저장되었습니다.", noseLength: user.noseLength });
}
