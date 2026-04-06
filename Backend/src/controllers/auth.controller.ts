import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TokenBlacklist from "../models/blackList.model";
import { redis } from "../config/redis.config";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET
const isProduction = process.env.NODE_ENV === "production";
const cookieSameSite = isProduction ? ("none" as const) : ("lax" as const);
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: cookieSameSite,
  maxAge: 3 * 24 * 60 * 60 * 1000,
};
const clearAuthCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: cookieSameSite,
};
/** 
 * Register controller --- handles user registration logic
 * post /api/auth/register
 */  
export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }


    const newUser: IUser = new User({ name, email, password });
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET!, { expiresIn: "3d" });
    await redis.set(`user:${newUser._id}`, token, { ex: 3 * 24 * 60 * 60 });
    await newUser.save();
    res.cookie("token", token, authCookieOptions);

    res.status(201).json({ message: "User registered successfully",user: { id: newUser._id, name: newUser.name, email: newUser.email } , token  });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error instanceof Error ? error.message : String(error) });
  }
}

/** 
 * Login controller --- handles user login logic
 * post /api/auth/login
 */
export const login = async (req: any, res: any) => {
  console.log("=== LOGIN REQUEST RECEIVED ===");
  console.log("Body:", JSON.stringify(req.body));
  try {
    const { email, password } = req.body;
    console.log("Step 1: Extracted email:", email);

    const user = await User.findOne({ email }).select("+password");
    console.log("Step 2: User found:", !!user);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Step 3: Password match:", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Step 4: JWT_SECRET exists:", !!JWT_SECRET);
    const token = jwt.sign({ id: user._id }, JWT_SECRET!, { expiresIn: "3d" });
    console.log("Step 5: Token generated");

    console.log("Step 6: Redis URL exists:", !!process.env.REDIS_URL);
    console.log("Step 6b: Redis TOKEN exists:", !!process.env.REDIS_TOKEN);
    await redis.set(`user:${user._id}`, token, { ex: 3 * 24 * 60 * 60 });
    console.log("Step 7: Redis set done");

    res.cookie("token", token, authCookieOptions);
    console.log("Step 8: Cookie set, sending response");

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email }, token });
    console.log("=== LOGIN SUCCESS ===");
  } catch (error) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error name:", error instanceof Error ? error.name : "unknown");
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    res.status(500).json({ message: "Server error during login", error: error instanceof Error ? error.message : String(error) });
  }
}

/** 
 * Logout controller --- handles user logout logic
 * post /api/auth/logout
 */
export const logout = async (req: any, res: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: "You are not logged in" });
  } 
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET!);
    await redis.del(`user:${decoded.id}`);
  } catch (err) {
    console.error("Token decode error on logout:", err);
  }
  res.clearCookie("token", clearAuthCookieOptions);
  await TokenBlacklist.create({ token });
  res.json({ message: "Logout successful" });
}
