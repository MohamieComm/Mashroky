import { getApiKeyValue } from '../services/api-keys.service.js';

export async function getPublicConfig(_req, res) {
  const admitadCampaignCode = await getApiKeyValue('admitad', 'campaign_code');
  res.json({ admitad_campaign_code: admitadCampaignCode || '' });
}

