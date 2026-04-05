import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // token comes in headers
  const authHeader = req.headers.authorization;

  // Expect: "Bearer TOKEN"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token." });
  }

  try {
    // extract token
    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user id to request
    req.userId = decoded.id;

    next(); // go to controller
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
