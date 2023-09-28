module.exports = (req, res, next) => {
//   throw new Error("test Error");
  res.status(404).json({ message: "Resource Not Found" });
};
