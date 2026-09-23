import User from "../models/User.js";
import FactCheck from "../models/FactCheck.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Get current user profile
 * GET /api/users/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User record not found.");
    }

    const trialsUsed = await FactCheck.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        avatar: user.avatar || "",
        trialsUsed,
        trialsRemaining: user.isPremium ? null : Math.max(0, 2 - trialsUsed),
        trialLimit: 2,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User record not found.");
    }

    if (name) {
      user.name = name.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile photo to Cloudinary
 * POST /api/users/avatar
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No image file provided for profile photo upload.");
    }

    // Stream upload directly from buffer to Cloudinary
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "truthscan_avatars",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const uploadResult = await uploadStream();

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User record not found.");
    }

    user.avatar = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded and updated successfully.",
      data: {
        avatar: user.avatar,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
