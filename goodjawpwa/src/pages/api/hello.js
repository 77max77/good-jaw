export default function handler(req, res) {
  if (req.method === 'GET') {
    // Respond to GET requests
    res.status(200).json({ message: 'Hello World' });
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
