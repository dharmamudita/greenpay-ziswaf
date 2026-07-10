// NOTE: socket.io-client dinonaktifkan sementara karena menyebabkan bug 'NONE' di React Native 0.76 (Expo SDK 54).
// Jika bug dari pihak socket.io sudah diperbaiki, kode asli bisa dikembalikan.

const mockSocket = {
  connect: () => {},
  disconnect: () => {},
  on: () => {},
  off: () => {},
  emit: () => {}
};

export default mockSocket;
