import ogs from "open-graph-scraper";

export const getSEOByURL = async (url) => {
  const options = {
    url,
    onlyGetOpenGraphInfo: true,
  };
  try {
    const { result } = await ogs(options);
    const previewUrl = {
      ogSiteName: result.ogSiteName,
      ogTitle: result.ogTitle,
      ogDescription: result.ogDescription,
      ogImage: result.ogImage[0],
      href: url,
    };
    return previewUrl;
  } catch (error) {
    return null;
  }
};
