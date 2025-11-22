import express from 'express';
import { faqController } from '../controllers/faqController.js';

const router = express.Router();

// Public routes 
router.get('/', faqController.getFAQs);
router.get('/:id', faqController.getFAQById);
router.get('/category/:category', faqController.getFAQsByCategory);

// Admin only 
router.post('/', faqController.createFAQ);
router.put('/:id', faqController.updateFAQ);
router.delete('/:id', faqController.deleteFAQ);
router.patch('/:id/status', faqController.toggleFAQStatus);
router.get('/admin/all', faqController.getAllFAQsForAdmin);

export default router;