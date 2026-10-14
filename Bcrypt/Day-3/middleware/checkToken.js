const checkToken = (req, res, next) => {
  const token = req.headers["token-key"];

  if (token === undefined || token === null) {
    console.log(token);
    return res.status(401).json({
      message: "Please enter token",
    });
  }
  if (token.trim() === "") {
    return res.status(401).json({
      message: "token is missing",
    });
  }
  if (token !== process.env.MY_TOKEN) {
    return res.status(401).json({
      message: "Please enter correct token",
    });
  }
  next();
};

export default checkToken;
