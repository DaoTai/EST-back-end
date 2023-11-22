import URLParse from "url-parse";

export const getUniqueValuesInArray = (arr) => {
  return Array.from(new Set(arr));
};

// Get urls in string
export const getUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  // Only get signle url
  if (urls && urls.length === 1) {
    const url = new URLParse(urls);
    if (url.protocol && url.host) {
      return url.href;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
