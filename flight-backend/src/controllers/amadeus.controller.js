import * as amadeusService from '../services/amadeus.service.js';

export async function pingAmadeus(req, res, next) {
  try {
    // attempt to get token
    const token = await amadeusService.getAccessToken();
    res.json({ ok: true, token: { tokenType: token.tokenType, expiresIn: token.expiresIn } });
  } catch (err) {
    next(err);
  }
}

export default { pingAmadeus };
