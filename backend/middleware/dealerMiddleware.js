const dealer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (req.user.role !== "dealer") {
    return res.status(403).json({
      success: false,
      message: "Dealer access required",
    });
  }

  next();
};

module.exports = dealer;
