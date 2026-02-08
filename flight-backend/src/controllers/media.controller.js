import { getServiceClient } from '../services/supabase.service.js';

export const upload = async (req, res, next) => {
  try {
    const client = getServiceClient();
    if (!client) return res.status(500).json({ error: 'supabase_not_configured' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file_required' });
    const bucket = req.body?.bucket || 'public';
    const filename = req.body?.path || `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
    const { data, error } = await client.storage.from(bucket).upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
    if (error) throw error;
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
    res.json({ path: data.path, url: urlData.publicUrl });
  } catch (err) {
    next(err);
  }
};
