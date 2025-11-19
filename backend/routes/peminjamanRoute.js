import express from 'express';
import { PeminjamanController } from '../controllers/peminjamanController.js';

const router = express.Router();

// Routes for peminjaman
router.post('/', PeminjamanController.createPeminjaman);
router.get('/', PeminjamanController.getAllPeminjaman);
router.get('/stats', PeminjamanController.getStats);
router.get('/:id', PeminjamanController.getPeminjamanById);
router.patch('/:id/status', PeminjamanController.updateStatus);
router.delete('/:id', PeminjamanController.deletePeminjaman);

export default router;