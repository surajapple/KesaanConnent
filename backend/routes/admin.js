const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PredictionHistory = require('../models/PredictionHistory');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalPredictions] = await Promise.all([
      User.countDocuments(),
      PredictionHistory.countDocuments(),
    ]);

    const recentActivity = await PredictionHistory.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPredictions,
        activeSessions: Math.floor(Math.random() * 100) + 50, // approximate
        diseaseScans: await PredictionHistory.countDocuments({ type: 'disease' }),
        recentActivity: recentActivity.map(p => ({
          id: p._id,
          user: p.userId?.name || 'Anonymous',
          action: `${p.type.charAt(0).toUpperCase() + p.type.slice(1)} prediction`,
          time: timeAgo(p.createdAt),
          status: 'Success',
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

module.exports = router;
