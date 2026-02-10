import { getApiKeyValue, getApiBaseUrl } from '../services/api-keys.service.js';

export async function getPublicConfig(_req, res) {
  const admitadCampaignCode = await getApiKeyValue('admitad', 'campaign_code');
  const moyasarPublishable = await getApiKeyValue('moyasar', 'publishable_key');
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const flightApiUrl = process.env.BACKEND_BASE_URL || '';
  // expose admin-managed base urls for public clients when safe
  const moyasarBase = await getApiBaseUrl('moyasar');
  res.json({
    admitad_campaign_code: admitadCampaignCode || '',
    moyasar_publishable_key: moyasarPublishable || '',
    moyasar_base_url: moyasarBase || '',
    supabase_url: supabaseUrl,
    flight_api_url: flightApiUrl,
  });
}

