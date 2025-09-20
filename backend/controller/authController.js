import User from "../models/UserModel.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";
import util from "util";

// REGISTER || POST || PUBLIC
export const signup = asyncErrorHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new CustomError("User already exists with this email"));
  }
  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    phone,
  });
await newUser.save()
  newUser.password = undefined;
  res.status(201).json({
    status: "success",
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// LOGIN || POST || PUBLIC
export const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new CustomError("Please provide email ID & Passowrd for login.", 400)
    );
  }
  const user = await User.findOne({ email }).select("+password  +active");
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 400));
  }

  if (!user.isActive) {
    return next(
      new CustomError("Your account is inactice. Please contact support.", 404)
    );
  }
  await user.recordLogin();
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  const options = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.sameSite = "None";
    options.secure = true;
  } else {
    options.sameSite = "Lax";
    options.secure = false;
  }
  res.cookie("jwt", refreshToken, options);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    role: user.role,
    user: {
      name: user.firstName,
      email: user.email,
      avatar: user.avatar,
      permissions: user.permission,
      purchasedCourses: user.purchasedCourses,
    },
    accessToken,
  });
});

export const protect = asyncErrorHandler(async (req, res, next) => {
  // read token if already exit
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return next(new CustomError("You are not logged in!", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError(
      "The user with give token does not exist",
      401
    );
    return next(error);
  }
  req.user = user;
  next();
});

export const refreshToken = asyncErrorHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return next(new CustomError("Refresh token missing", 401));

  const refreshToken = cookies.jwt;
  const decodedToken = await util.promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_STR
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError(
      "The user with give token does not exist",
      401
    );
    return next(error);
  }
  const accessToken = user.generateAccessToken();
  res.status(200).json({
    status: "success",
    role: user.role,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      permissions: user.permissions,
      purchasedCourses: user.purchasedCourses,
    },
    accessToken,
  });
});

export const logOut = asyncErrorHandler(async (req, res, next) => {
  const cookies = req.cookies;
  const refreshToken = cookies.jwt;
  const decodedToken = await util.promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_STR
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const error = new CustomError(
      "The user with give token does not exist",
      401
    );
    return next(error);
  }
  const options = {
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.sameSite = "None";
    options.secure = true;
  } else {
    options.sameSite = "Lax";
    options.secure = false;
  }

  res.clearCookie("jwt", options);
  res.status(204).json({
    status: "success",
  });
});

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new CustomError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

// GET CURRENT USER || GET || PRIVATE
export const getMe = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json({
    success: true,
    user,
  });
});

// ADD-ADDRESS || POST || PRIVATE
export const addAddress = asyncErrorHandler(async (req, res, next) => {
  const { street, city, state, zipCode, country, isDefault = false } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return next(new CustomError("User not found"), 404);
  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }
  user.addresses.push({ street, city, state, zipCode, country, isDefault });
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// UPDATE || PATCH || PRIVATE
export const updateAddress = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found"), 404);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return next(new CustomError("Address not found"), 404);
  // Update fields
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zipCode) address.zipCode = zipCode;
  if (country) address.country = country;
  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;
  }
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// DELETE || DELETE || PRIVATE
export const deleteAddress = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new CustomError("User not found"), 404);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return next(new CustomError("Address not found"), 404);
  await address.deleteOne();
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// ALL-ADDRESS || GET || PRIVATE
export const getAddresses = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("addresses");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ success: true, addresses: user.addresses });
});
