const fs = require('fs');
const files = [
  'mobile/app/bank-sampah.js',
  'mobile/app/leaderboard.js',
  'mobile/app/notifications.js',
  'mobile/app/profile/register-distrik.js'
];

const dict = {
  'Lokasi Setoran': '{t("bank_sampah.location", {defaultValue: "Lokasi Setoran"})}',
  'Setoran Manual': '{t("bank_sampah.manual_deposit", {defaultValue: "Setoran Manual"})}',
  'Kategori Sampah': '{t("bank_sampah.waste_category", {defaultValue: "Kategori Sampah"})}',
  'Ganti Foto': '{t("bank_sampah.retake_photo", {defaultValue: "Ganti Foto"})}',
  'Ketuk untuk potret sampah': '{t("bank_sampah.tap_to_capture", {defaultValue: "Ketuk untuk potret sampah"})}',
  'ESTIMASI PENDAPATAN': '{t("bank_sampah.est_revenue", {defaultValue: "ESTIMASI PENDAPATAN"})}',
  'Pilih Distrik': '{t("bank_sampah.select_district", {defaultValue: "Pilih Distrik"})}',
  'Tempat penyaluran setoran sampah Anda': '{t("bank_sampah.district_subtitle", {defaultValue: "Tempat penyaluran setoran sampah Anda"})}',
  
  'Jadilah yang Terbaik!': '{t("leaderboard.hero_text", {defaultValue: "Jadilah yang Terbaik!"})}',
  
  'Notifikasi': '{t("notifications.title", {defaultValue: "Notifikasi"})}',
  'Belum ada notifikasi baru': '{t("notifications.empty_title", {defaultValue: "Belum ada notifikasi baru"})}',
  'Notifikasi seputar transaksi dan aktivitas Anda akan muncul di sini.': '{t("notifications.empty_desc", {defaultValue: "Notifikasi seputar transaksi dan aktivitas Anda akan muncul di sini."})}',

  'Menunggu Verifikasi': '{t("reg_distrik.waiting", {defaultValue: "Menunggu Verifikasi"})}',
  'Kembali': '{t("reg_distrik.back", {defaultValue: "Kembali"})}',
  'Daftar Distrik Sampah': '{t("reg_distrik.title", {defaultValue: "Daftar Distrik Sampah"})}',
  'Nama Bank Sampah / Distrik': '{t("reg_distrik.name_label", {defaultValue: "Nama Bank Sampah / Distrik"})}',
  'Alamat Lengkap': '{t("reg_distrik.address_label", {defaultValue: "Alamat Lengkap"})}',
  'Nomor WhatsApp/HP': '{t("reg_distrik.phone_label", {defaultValue: "Nomor WhatsApp/HP"})}',
  'Kirim Pengajuan': '{t("reg_distrik.submit", {defaultValue: "Kirim Pengajuan"})}',
  'Cek Email Anda': '{t("reg_distrik.check_email", {defaultValue: "Cek Email Anda"})}',
  'Verifikasi': '{t("reg_distrik.verify", {defaultValue: "Verifikasi"})}',
  'Batal': '{t("reg_distrik.cancel", {defaultValue: "Batal"})}'
};

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Make sure i18n is imported
  if (!content.includes('useTranslation')) {
    content = content.replace('import React', 'import React\\nimport { useTranslation } from "react-i18next";\\n');
  }
  
  // Make sure t is extracted
  if (!content.includes('const { t } = useTranslation();') && !content.includes('const { t, i18n } = useTranslation();')) {
    content = content.replace(/const \\[.*?\\] = useState/i, (match) => {
      return 'const { t } = useTranslation();\n  ' + match;
    });
  }

  for (const [indo, engWrap] of Object.entries(dict)) {
    // Replace exact Text content
    const regex = new RegExp('<Text([^>]*)>' + indo.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '<\\\\/Text>', 'g');
    if (content.match(regex)) {
      content = content.replace(regex, '<Text$1>' + engWrap + '</Text>');
      changed = true;
    }
  }

  if (content.includes('Pengajuan Anda sebagai Distrik Sampah')) {
    content = content.replace(/<Text([^>]*)>\\s*Pengajuan Anda sebagai Distrik Sampah[^<]*<\\/Text>/g, '<Text$1>{t("reg_distrik.waiting_desc", {defaultValue: "Pengajuan Anda sebagai Distrik Sampah sedang ditinjau oleh Admin. Mohon bersabar ya!"})}</Text>');
    changed = true;
  }
  
  if (content.includes('Bergabunglah menjadi mitra pengelola sampah')) {
    content = content.replace(/<Text([^>]*)>\\s*Bergabunglah menjadi mitra pengelola sampah[^<]*<\\/Text>/g, '<Text$1>{t("reg_distrik.subtitle", {defaultValue: "Bergabunglah menjadi mitra pengelola sampah di lingkungan Anda dan tebarkan manfaat."})}</Text>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
