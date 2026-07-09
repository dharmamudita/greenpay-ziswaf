import { io } from 'socket.io-client';

// Sesuaikan URL ini dengan alamat IP komputer Anda yang menjalankan backend
// (Sama dengan IP yang ada di api.js tanpa tambahan /api)
const SOCKET_URL = 'http://192.168.1.13:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false, // Jangan otomatis connect dulu, tunggu login
  transports: ['websocket'], // Gunakan websocket agar lebih cepat
});

export default socket;
