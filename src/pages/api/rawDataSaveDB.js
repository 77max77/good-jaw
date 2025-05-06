export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',   // 필요에 따라 '10mb' 등으로 조정
    },
  },
};
import dbConnect from "../../../database/dbconnect";
import MeasureData from '../../../database/model/MeasureData';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Connect to the database
      await dbConnect();

      // Extract data from the request body
      const { user, rawData, summaryData } = req.body;

      if (!user || !rawData || !summaryData) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Create and save the document
      const newMeasureData = new MeasureData({
        user,          // 🔹 유저 정보 추가
        rawData,
        summaryData,
        createdAt: new Date()
      });

      const savedAnalysis = await newMeasureData.save();

      // Return the saved document's ObjectId
      res.status(201).json({
        success: true,
        message: 'Data saved successfully',
        id: savedAnalysis._id,
      });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ success: false, error: 'Failed to save data' });
    }
  } else if (req.method === 'GET') {
    try {
      // Connect to the database
      await dbConnect();

      // Extract ObjectId from the query string
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ success: false, error: 'ObjectId is required' });
      }

      // Fetch the specific document by ObjectId
      const getData = await MeasureData.findById(id);

      if (!getData) {
        return res.status(404).json({ success: false, error: 'Data not found' });
      }

      res.status(200).json({ success: true, data: getData });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
