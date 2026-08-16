const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authUser(req, res, next) {
  console.log("req.cookies:", req.cookies); // Log the cookies to see what is being sent
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "User Not Logged In" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    const user = await userModel.findById({
      _id: decoded.id,
    })

         if (!user) {
      return res.status(401).json({
        message: "User not found, please login again",
      });
    }

    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}

module.exports = {
  authUser,
};
