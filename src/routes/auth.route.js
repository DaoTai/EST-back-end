import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Hello ae rapper 123</h1>");
});

export default router;
