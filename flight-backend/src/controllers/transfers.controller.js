import * as transfersService from '../services/transfers.service.js';

export async function searchTransfers(req, res, next) {
  try {
    const result = await transfersService.searchTransfers(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTransferDetails(req, res, next) {
  try {
    const result = await transfersService.getTransferDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookTransfer(req, res, next) {
  try {
    const result = await transfersService.bookTransfer(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}
