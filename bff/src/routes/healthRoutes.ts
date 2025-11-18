import express from 'express';
import axios from 'axios';

const router = express.Router();
const CORE_URL = process.env.CORE_URL || 'http://localhost:8080';

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${CORE_URL}/core/health`, {
      headers: {
        'Accept': 'text/plain'
      }
    });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to core service'
    });
  }
});

export default router;

