import { verifyAccessToken } from "../utils/tokens.js";
import User from "../models/User.js";

/**
 * Protect middleware:
 * Validates JWT access token in Authorization: Bearer <token>
 * Attaches decoded user payload { userId, role } to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Access denied. No authentication token provided."));
  }

  try {
    const decoded = verifyAccessToken(token);

    // Verify user still exists in database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401);
      return next(new Error("User account associated with this token no longer exists."));
    }

    req.user = user;
    req.userToken = decoded;
    next();
  } catch (error) {
    res.status(401);
    return next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Checks if logged-in user possesses one of the allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Access forbidden: User role '${req.user?.role}' is not authorized.`)
      );
    }
    next();
  };
};
