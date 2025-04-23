import dbConnect from "../../../../database/dbconnect";
import User from '../../../../database/model/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '등록되지 않은 이메일입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // ✅ 로그인 성공 시
    return res.status(200).json({
      message: '로그인 성공',
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        birthYear: user.birthYear,
        gender: user.gender,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
