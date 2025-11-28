import express from 'express';
import axios from 'axios';

const router = express.Router();
const CORE_URL = process.env.CORE_URL || 'http://localhost:8080';

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${CORE_URL}/core/health`, {
      headers: {
        'Accept': 'text/plain'
      },
      timeout: 10000 // 10 second timeout
    });
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    // Provide more detailed error information
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || error.message || 'Failed to connect to core service';
    
    // If it's a 429, it might be Render spinning up the service
    if (statusCode === 429) {
      return res.status(503).json({
        success: false,
        message: 'Core service is rate-limited or spinning up. This is common on Render free tier after inactivity. Try again in a few seconds.',
        details: `Core URL: ${CORE_URL}`,
        error: errorMessage
      });
    }
    
    // Connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Cannot connect to core service. Check if Core service is running and CORE_URL is correct.',
        details: `Core URL: ${CORE_URL}`,
        error: error.message
      });
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details: `Core URL: ${CORE_URL}`,
      statusCode: statusCode
    });
  }
});

export default router;

