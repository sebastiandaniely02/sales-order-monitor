const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

async function request(path = '', params = {}, signal) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;

  let response;
  try {
    response = await fetch(url, {
      headers: { 'x-assessment-key': API_KEY },
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Network error. Please check your internet connection.');
  }

  if (!response.ok) {
    throw new Error(`The server returned an error (HTTP ${response.status}).`);
  }
  return response.json();
}

export function getMeta(signal) {
  return request('/meta', {}, signal);
}

export function getOrders(params, signal) {
  return request('', params, signal);
}