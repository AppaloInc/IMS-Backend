import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, admin } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    admin: admin || false, // Set admin to false if not provided
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new apiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true, //we get info after update
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"));
});

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingRefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;
//   //in case of mobile app development req.body.refreshToken
//   if (!incomingRefreshToken) {
//     throw new apiError(401, "unauthorized request");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       throw new apiError(401, "Invalid refresh token");
//     }

//     if (incomingRefreshToken !== user?.refreshToken) {
//       throw new apiError(401, "Refresh token is expired or used");
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     const { accessToken, newRefreshToken } =
//       await generateAccessAndRefereshTokens(user._id);

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newRefreshToken, options)
//       .json(
//         new apiResponse(
//           200,
//           { accessToken, refreshToken: newRefreshToken },
//           "Access token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new apiError(401, error?.message || "Invalid refresh token");
//   }
// });
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.header("x-refresh-token") || // Check the custom header
    req.header("Authorization")?.replace("Bearer ", "") || // Check the Authorization header
    req.cookies.refreshToken || // Check cookies
    req.body.refreshToken; // Check the request body

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request: Refresh token missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new apiError(401, "Invalid refresh token: User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"));
});


const getUsersByPagination = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Filter to get non-admin users OR the current user
    const filter = {
      $or: [
        { admin: false },
        { _id: currentUser._id }
      ]
    };

    // Fetch users with pagination
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Format response with current user flag
    const formattedUsers = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.status(200).json({
      message: "Users retrieved successfully",
      currentPage: pageNumber,
      totalPages,
      totalUsers,
      users: formattedUsers,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving users", 
      error: error.message 
    });
  }
};

const deleteUser = asyncHandler(async (req, res) => {
  // Get current user from request
  const currentUser = req.user;
  
  // Only allow admins to delete users
  if (!currentUser?.admin) {
    throw new apiError(403, "Unauthorized access");
  }

  // Get user ID from params
  const { id } = req.params;
  
  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid user ID");
  }

  // Prevent self-deletion
  if (id === currentUser._id.toString()) {
    throw new apiError(400, "Cannot delete your own account");
  }

  // Find and delete user
  const deletedUser = await User.findByIdAndDelete(id);
  
  if (!deletedUser) {
    throw new apiError(404, "User not found");
  }

  return res.status(200)
    .json(new apiResponse(200, {}, "User deleted successfully"));
});



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
    getUsersByPagination,
    deleteUser,
  };