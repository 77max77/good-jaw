import dbConnect from "../../../database/dbconnect";
import Analysis from '../../../database/model/Analysis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Connect to the database
      await dbConnect();

      // Extract data from the request body
      const analysisData = req.body;

      // Create and save the document
      const newAnalysis = new Analysis(analysisData);
      const savedAnalysis = await newAnalysis.save();

      // Return the saved document's ObjectId
      res.status(201).json({ success: true, message: 'Data saved successfully', id: savedAnalysis._id });
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
      const analysis = await Analysis.findById(id);

      if (!analysis) {
        return res.status(404).json({ success: false, error: 'Data not found' });
      }

      res.status(200).json({ success: true, data: analysis });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch data' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
