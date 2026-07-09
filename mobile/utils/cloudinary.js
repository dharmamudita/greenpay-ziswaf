export const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dqf0a7fgm/image/upload';
export const UPLOAD_PRESET = 'greenpay-ziswaf';

/**
 * Mengunggah gambar ke Cloudinary
 * @param {string} imageUri - URI gambar lokal (misal dari ImagePicker)
 * @returns {Promise<string>} - URL gambar dari Cloudinary
 */
export const uploadToCloudinary = async (imageUri) => {
  try {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    });
    data.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error(result.error?.message || 'Gagal mengunggah ke Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

/**
 * Membuat URL gambar dengan Watermark Waktu
 * @param {string} originalUrl - URL Cloudinary asli
 * @returns {string} - URL dengan overlay watermark
 */
export const getWatermarkedUrl = (originalUrl) => {
  // Format waktu saat ini: "10 Jul 2026 12:00:45"
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // URL encoding untuk spasi menjadi %20
  const text = encodeURIComponent(`GreenPay ZISWAF - ${dateStr} ${timeStr}`);
  
  // Cloudinary Transformation parameters:
  const watermarkParams = `l_text:Arial_24_bold:${text},co_white,g_south_east,x_15,y_15`;
  const bgParams = `l_text:Arial_24_bold:${text},co_black,g_south_east,x_13,y_13`; // Shadow effect for readability

  // Sisipkan transformasi ke dalam URL Cloudinary sebelum "/v" versi
  const parts = originalUrl.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${bgParams}/${watermarkParams}/${parts[1]}`;
  }
  return originalUrl; // Fallback jika bukan URL Cloudinary
};
