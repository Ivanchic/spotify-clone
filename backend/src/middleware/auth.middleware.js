import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  if (!req.auth.userId) {
    return res
      .status(401)
      .json({ message: 'Unauthorized - you must be logged in' });
  }
  next();
};

export const authMiddleware = async (req, res, next) => {

  if(!req.auth.userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }

  next();
  // You can add more logic here if needed, such as fetching user details from Clerk
};


export const requireAdmin = async (req, res, next) => {

  try{
    constUser = await clerkClient.users.getUser(req.auth.userId);
    const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden - you must be an admin" });
    }
    next();

  } catch (error){
   return res.status(500).json({ message: "Internal Server Error" ,error});
  }
}