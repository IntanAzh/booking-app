const jwt = require("jsonwebtoken");

const blacklistedTokens = new Set();

const getTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

// Verify token 
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "Token dibutuhkan" });
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Format token harus Bearer" });
  }

  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return res.status(403).json({ message: "Format token salah" });
  }

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token sudah logout" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

// Check role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole, blacklistToken };
