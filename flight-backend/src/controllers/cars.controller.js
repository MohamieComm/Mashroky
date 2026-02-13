import * as carService from '../services/car-rental.service.js';

export async function searchCars(req, res, next) {
  try {
    const result = await carService.searchCars(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCarDetails(req, res, next) {
  try {
    const result = await carService.getCarDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookCar(req, res, next) {
  try {
    const result = await carService.bookCar(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}
