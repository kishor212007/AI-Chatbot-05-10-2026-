import { Router } from 'express';
import { handleChatMessage, handleHealthCheck } from '../controllers/chatController.js';

const router = Router();

// POST /api/chat
router.post('/chat', handleChatMessage);

// GET /api/health
router.get('/health', handleHealthCheck);

export default router;
