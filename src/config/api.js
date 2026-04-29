// Central API configuration
// In development: uses localhost:5000
// In production: uses VITE_BACKEND_URL environment variable (e.g. Render URL)

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://" + window.location.hostname + ":5000";

export default BACKEND_URL;
