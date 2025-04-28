import dbConnect from "../../../../database/dbconnect";
import User from '../../../../database/model/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, nickname, name, birthYear, gender, phone, noseLength } = req.body;
  if (!email || !password || !nickname || !name || !birthYear || !gender || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await dbConnect();
    // 이메일 또는 닉네임 중복 검사
    const exists = await User.findOne({ $or: [{ email }, { nickname }] });
    if (exists) {
      const field = exists.email === email ? 'Email' : 'Nickname';
      return res.status(409).json({ message: `${field} already in use` });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, nickname, name, birthYear, gender, phone });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
