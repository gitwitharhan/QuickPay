// In dev: Directly point to localhost:3000. Backend handles CORS.
// In production: Use explicit valid URL or fallback to Render URL.
const envUrl = import.meta.env.VITE_BACKEND_URL;
let BASE_URL;

if (import.meta.env.DEV) {
  BASE_URL = 'http://localhost:3000';
} else {
  // Use VITE_BACKEND_URL if it's a valid absolute URL, otherwise fallback to Render
  if (envUrl && envUrl.startsWith('http')) {
    BASE_URL = envUrl.replace(/\/$/, '');
  } else {
    // Definitive fallback for production
    BASE_URL = 'https://quickpay-7rda.onrender.com';
  }
}

console.log('Final BASE_URL:', BASE_URL);

export default BASE_URL;
