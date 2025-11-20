// routes/riwayat.js
import express from 'express';
import { riwayatController } from '../controllers/riwayatController.js';

const router = express.Router();

router.get('/', riwayatController.getAllRiwayat);
router.get('/statistik', riwayatController.getStatistik);
router.post('/selesai', riwayatController.selesaikanPeminjaman);
router.post('/timeline', riwayatController.updateTimeline);
router.get('/timeline/:peminjamanId', riwayatController.getTimeline);
router.get('/export', riwayatController.exportRiwayat);
router.get('/:id', riwayatController.getRiwayatById);

export default router;