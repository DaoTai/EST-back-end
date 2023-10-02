const handlingErrorMiddleware = (err, req, res, next) => {
  if (err instanceof Error) {
    console.log("Error: ", err);
    return res.status(500).json(err.message);
  }
  return res.status(500).json("Server error");
};

export default handlingErrorMiddleware;
