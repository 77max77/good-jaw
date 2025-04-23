import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 중복 정의 방지 (Next.js hot reload 문제 해결)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
