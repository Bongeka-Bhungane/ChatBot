const express = require('express');
const { chatWithModel } = require('../controllers/chatController');

const router = express.Router();

// Chat endpoint
router.post('/chat', chatWithModel);

module.exports = router;
