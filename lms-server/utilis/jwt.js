const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // Parse cookie expiration days safely
  const days = parseInt(process.env.COOKIE_EXPIRES_TIME || "2", 10);

  // Fallback to 2 days if invalid
  const cookieExpireMs = isNaN(days)
    ? 2 * 24 * 60 * 60 * 1000
    : days * 24 * 60 * 60 * 1000;

  const options = {
    expires: new Date(Date.now() + cookieExpireMs),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
    sameSite: "Lax", // helps prevent CSRF
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
