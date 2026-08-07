/**
 * Decodes a JWT token without using external libraries.
 * @param {string} token - The JWT token to decode.
 * @returns {object|null} - The decoded payload or null if invalid.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if a token is expired.
 * @param {string} token - The JWT token to check.
 * @returns {boolean} - True if expired, false otherwise.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // Add a small buffer (e.g., 5 seconds) to handle slight clock skews
  const bufferSeconds = 5;
  const currentTime = Math.floor(Date.now() / 1000);
  
  return decoded.exp < (currentTime + bufferSeconds);
};
