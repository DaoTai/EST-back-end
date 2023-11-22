import mongoose from "mongoose";

const SEOImageSchema = new mongoose.Schema(
  {
    width: String,
    height: String,
    url: String,
  },
  {
    _id: false,
  }
);

const SEOSchema = new mongoose.Schema(
  {
    ogUrl: String,
    ogTitle: String,
    ogDescription: String,
    href: String,
    ogImage: SEOImageSchema,
  },
  {
    _id: false,
  }
);

export default SEOSchema;
