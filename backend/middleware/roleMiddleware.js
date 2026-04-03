export const roleMiddleware = (allowedRoles) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }


    if (!req.user.role) {
      return res.status(401).json({
        message: "Role missing",
      });
    }


    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }


    next();

  };

};