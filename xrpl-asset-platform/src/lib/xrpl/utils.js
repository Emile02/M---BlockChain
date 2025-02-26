// src/lib/xrpl/utils.js

/**
 * Decodes a hex string into a regular string
 * @param {string} hex - Hex string to decode
 * @returns {string} Decoded string
 */
export function hexToString(hex) {
  // Check if the hex string has a 0x prefix and remove it
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }

  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const hexChar = hex.substr(i, 2);
    str += String.fromCharCode(parseInt(hexChar, 16));
  }
  return str;
}

/**
 * Decodes a URI field from an NFToken
 * @param {string} hexUri - Hex-encoded URI from token
 * @returns {Object} Parsed metadata or empty object if parsing fails
 */
export function decodeTokenMetadata(hexUri) {
  if (!hexUri) return {};

  try {
    const jsonString = hexToString(hexUri);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to decode token metadata:", err);
    return {};
  }
}

/**
 * Formats a token ID for display
 * @param {string} tokenId - Full token ID
 * @param {number} length - Length of the truncated ID
 * @returns {string} Truncated token ID with ellipsis
 */
export function formatTokenId(tokenId, length = 8) {
  if (!tokenId) return "N/A";

  if (tokenId.length <= length * 2) {
    return tokenId;
  }

  return `${tokenId.substring(0, length)}...${tokenId.substring(
    tokenId.length - length
  )}`;
}

/**
 * Converts XRP to drops (1 XRP = 1,000,000 drops)
 * @param {number|string} xrp - Amount in XRP
 * @returns {string} Amount in drops
 */
export function convertXrpToDrops(xrp) {
  const drops = String(Math.floor(Number(xrp) * 1000000));
  return drops;
}

/**
 * Converts drops to XRP (1 XRP = 1,000,000 drops)
 * @param {number|string} drops - Amount in drops
 * @returns {string} Amount in XRP with 6 decimal places
 */
export function convertDropsToXrp(drops) {
  const xrp = (Number(drops) / 1000000).toFixed(6);
  return xrp;
}

/**
 * Gets a random color based on a string (e.g., for avatar backgrounds)
 * @param {string} str - Input string
 * @returns {string} Hex color code
 */
export function getColorFromString(str) {
  if (!str) return "#228be6"; // Default blue

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
}
