import { getServiceClient } from '../services/supabase.service.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'video/mp4',
]);
const ALLOWED_BUCKETS = new Set(['public', 'avatars', 'media', 'promo']);

const ensureBucketExists = async (client, bucketName) => {
  try {
    const { error } = await client.storage.getBucket(bucketName);
    if (error && (error.message || '').toLowerCase().includes('not found')) {
      await client.storage.createBucket(bucketName, { public: true, fileSizeLimit: 52428800 });
    }
  } catch {
    try {
      await client.storage.createBucket(bucketName, { public: true, fileSizeLimit: 52428800 });
    } catch { /* bucket may already exist */ }
  }
};

export const upload = async (req, res, next) => {
  try {
    const client = getServiceClient();
    if (!client) return res.status(500).json({ error: 'supabase_not_configured' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file_required' });
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return res.status(400).json({ error: 'unsupported_file_type' });
    }
    const bucket = ALLOWED_BUCKETS.has(req.body?.bucket) ? req.body.bucket : 'public';
    await ensureBucketExists(client, bucket);
    const filename = req.body?.path || `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-');
    const { data, error } = await client.storage.from(bucket).upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw error;
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(data.path);
    res.json({ path: data.path, url: urlData.publicUrl });
  } catch (err) {
    next(err);
  }
};
