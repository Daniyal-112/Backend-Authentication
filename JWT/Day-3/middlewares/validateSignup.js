const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }
  next();
};
export default validateSignup;
