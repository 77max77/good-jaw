import mongoose from 'mongoose';

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); //데이터베이스 연결 주소
        console.log('MongoDB 연결 성공');
    } catch (err) {
        console.error('MongoDB 연결 실패', err);
        process.exit(1);
    }
};

export default dbConnect;

