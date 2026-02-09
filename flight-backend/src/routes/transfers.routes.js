import express from 'express';
import {
  searchTransfers,
  getTransferDetails,
  bookTransfer,
} from '../controllers/transfers.controller.js';

const router = express.Router();

router.post('/search', searchTransfers);
router.post('/details', getTransferDetails);
router.post('/book', bookTransfer);

export default router;
