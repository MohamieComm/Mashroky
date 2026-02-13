import * as hotelService from '../services/hotel.service.js';

export async function searchHotels(req, res, next) {
  try {
    const result = await hotelService.searchHotels(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHotelDetails(req, res, next) {
  try {
    const result = await hotelService.getHotelDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookHotel(req, res, next) {
  try {
    const result = await hotelService.bookHotel(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}
