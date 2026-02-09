import * as toursService from '../services/tours.service.js';

export async function searchTours(req, res, next) {
  try {
    const result = await toursService.searchTours(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTourDetails(req, res, next) {
  try {
    const result = await toursService.getTourDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookTour(req, res, next) {
  try {
    const result = await toursService.bookTour(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}
