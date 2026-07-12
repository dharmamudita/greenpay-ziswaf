const express = require('express');
const router = express.Router();

const axios = require('axios');
const AI_MODELS = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Helper: panggil Gemini REST API langsung (lebih cepat dari SDK)
async function callGeminiAPI(apiKey, modelName, requestBody) {
  const url = `${API_BASE}/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000 // 15 seconds timeout
    });

    const data = response.data;
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textParts = parts.filter(p => p.text && !p.thought);
    return textParts.map(p => p.text).join('').trim();
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message || `HTTP Error`;
    throw new Error(`[Axios] ${errMsg}`);
  }
}

// Helper: coba beberapa model dengan retry
async function generateWithFallback(apiKey, requestBody, maxRetries = 1) {
  for (const modelName of AI_MODELS) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI] Trying ${modelName} (attempt ${attempt + 1})...`);
        const result = await callGeminiAPI(apiKey, modelName, requestBody);
        console.log(`[AI] ${modelName} responded in attempt ${attempt + 1}`);
        return result;
      } catch (error) {
        const msg = error.message || '';
        console.log(`[AI] ${modelName} failed: ${msg.substring(0, 100)}`);

        // 429 (quota) atau 404 (model hilang) => langsung coba model lain
        if (msg.includes('429') || msg.includes('404')) break;

        // 503 (sibuk) => tunggu sebentar lalu retry
        if (msg.includes('503') && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        break;
      }
    }
  }
  throw new Error('Semua model AI sedang sibuk. Silakan coba lagi dalam beberapa saat.');
}

// Middleware: cek API Key
const checkAiConfig = (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum dikonfigurasi di file .env backend.',
    });
  }
  next();
};

// ==========================================
// 1. AI Waste Scanner (Computer Vision)
// ==========================================
router.post('/scan-waste', checkAiConfig, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'URL gambar diperlukan.' });

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `Analisis gambar sampah ini. Berikan JSON murni TANPA markdown:
{"detected_items":"...","waste_category":"Plastik/Kertas/Logam/Kaca/Organik","estimated_weight_kg":0.5,"estimated_points":150,"fun_fact":"..."}
Jika bukan sampah: {"error":"Bukan sampah daur ulang."}`;

    const requestBody = {
      contents: [{ role: 'user', parts: [
        { text: prompt },
        { inlineData: { data: buffer.toString('base64'), mimeType } }
      ]}],
      generationConfig: {
        maxOutputTokens: 256,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    const responseText = await generateWithFallback(process.env.GEMINI_API_KEY, requestBody);
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);
    res.json(parsedData);
  } catch (error) {
    console.error('AI Scanner Error:', error.message);
    res.status(500).json({ error: error.message || 'Gagal menganalisis gambar.' });
  }
});

// ==========================================
// 2. ZISWAF Impact Forecaster
// ==========================================
router.post('/impact', checkAiConfig, async (req, res) => {
  try {
    const { points, campaignType } = req.body;

    const prompt = `Buatkan 1 paragraf pendek (2-3 kalimat) yang menyentuh hati tentang dampak donasi ${points} Green Points ke kampanye "${campaignType}". Awali dengan "Masya Allah".`;

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    const result = await generateWithFallback(process.env.GEMINI_API_KEY, requestBody);
    res.json({ forecast: result });
  } catch (error) {
    console.error('AI Impact Error:', error.message);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan prediksi dampak.' });
  }
});

// ==========================================
// 3. Eco-Ustadz Chatbot (LLM)
// ==========================================
router.post('/chat', checkAiConfig, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: `Anda adalah "Eco-Ustadz", asisten AI cerdas di aplikasi GreenPay ZISWAF. Jawab ramah, Islami, dan singkat (3-5 kalimat). Gunakan emoji sesekali.

TENTANG APLIKASI:
GreenPay ZISWAF adalah platform Green Economy berbasis Islam yang menggabungkan kekuatan ZISWAF (Zakat, Infak, Sedekah, Wakaf) dengan aksi pelestarian lingkungan. Misi: mewujudkan Indonesia Hijau melalui ekonomi sirkular Islami.

FITUR-FITUR UTAMA:
1. PROGRAM ZISWAF - Pengguna bisa menyalurkan Zakat (wajib 2.5% dari harta yang mencapai nisab), Infak (sumbangan sukarela), Sedekah (kebaikan apa saja), dan Wakaf (menyerahkan harta untuk kepentingan umum). Ada tombol "Prediksi AI" yang menampilkan dampak indah dari donasi.
2. BANK SAMPAH - Pengguna bisa menyetor sampah di titik-titik Bank Sampah terdekat yang ditampilkan di peta. Setiap setoran sampah akan dikonversi menjadi Green Points. Tersedia fitur "AI Waste Scanner" untuk memindai sampah sebelum disetor.
3. AI WASTE SCANNER - Fitur canggih yang menggunakan kamera HP untuk memindai/foto sampah. AI akan menganalisis jenis sampah (Plastik/Kertas/Logam/Kaca/Organik), estimasi berat, dan potensi Green Points yang bisa didapat.
4. GREEN POINT - Sistem poin hijau yang didapat dari menyetor sampah atau berpartisipasi dalam program lingkungan. Poin bisa ditukar dengan reward (hadiah ramah lingkungan).
5. MARKETPLACE - Tempat belanja produk ramah lingkungan dari UMKM lokal.
6. DASHBOARD DAMPAK - Menampilkan ringkasan kontribusi pengguna: jumlah sampah didaur ulang, pohon yang ditanam, dana ZISWAF yang disalurkan, dan UMKM yang diberdayakan.
7. IMPACT PASSPORT - Paspor digital yang mencatat perjalanan kebaikan pengguna, seperti pencapaian dan milestone.
8. LEADERBOARD - Peringkat Top 10 Pahlawan Hijau berdasarkan kontribusi terbesar bulan ini.
9. REWARD - Tukar Green Points dengan hadiah ramah lingkungan (tumbler, tas belanja, dll).
10. ECO-USTADZ (ini Anda!) - Chatbot AI yang membantu pengguna dengan pertanyaan seputar ZISWAF, hukum Islam terkait lingkungan, dan cara menggunakan aplikasi.

CARA MENGGUNAKAN APLIKASI:
- Daftar akun → Login → Pilih fitur dari Beranda
- Untuk donasi: Buka tab ZISWAF → Pilih program → Masukkan jumlah → Donasi
- Untuk setor sampah: Buka Bank Sampah → Cari lokasi terdekat → Setor → Dapat poin
- Untuk scan sampah: Buka AI Scanner → Foto sampah → Lihat estimasi poin
- Untuk tukar reward: Buka Green Point → Pilih reward → Tukar dengan poin
- Pengaturan: Bisa ganti tema (terang/gelap), bahasa (Indonesia/Inggris), dan edit profil

PANDUAN ISLAMI:
- Zakat: Wajib 2.5% untuk harta yang mencapai nisab (setara 85 gram emas), sudah haul (1 tahun)
- Infak: Sumbangan sukarela di jalan Allah, tidak ada batas minimum
- Sedekah: Segala bentuk kebaikan, termasuk senyum dan mendaur ulang sampah
- Wakaf: Menyerahkan harta untuk kepentingan umat, pahalanya mengalir terus (jariyah)
- Green Islam: Menjaga lingkungan adalah amanah sebagai Khalifah fil Ardh (QS. Al-Baqarah: 30)

ATURAN:
- Selalu dorong pengguna untuk aktif menggunakan fitur-fitur aplikasi
- Jika ditanya di luar topik agama/lingkungan/aplikasi, tolak dengan halus
- Jika ditanya cara menggunakan fitur, jelaskan langkah-langkahnya
- Sapa dengan "Assalamu'alaikum" di awal percakapan baru` }]
      },
      generationConfig: {
        maxOutputTokens: 400,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    const result = await generateWithFallback(process.env.GEMINI_API_KEY, requestBody);
    res.json({ reply: result });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ error: error.message || 'Gagal memproses pesan AI.' });
  }
});

module.exports = router;
