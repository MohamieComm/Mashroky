import { getApiKeyValue, getApiBaseUrl } from '../services/api-keys.service.js';

export async function getPublicConfig(_req, res) {
  const admitadCampaignCode = await getApiKeyValue('admitad', 'campaign_code');
  const moyasarPublishable = await getApiKeyValue('moyasar', 'publishable_key');
  const moyasarBase = await getApiBaseUrl('moyasar');
  res.json({
    admitad_campaign_code: admitadCampaignCode || '',
    moyasar_publishable_key: moyasarPublishable || '',
    moyasar_base_url: moyasarBase || '',
  });
}

