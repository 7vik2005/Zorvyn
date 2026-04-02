import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Helper: Email regex (basic but effective)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, "Please provide a valid email"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password by default
    },

    role: {
      type: String,
      enum: {
        values: ["viewer", "analyst", "admin"],
        message: "Role must be viewer, analyst, or admin",
      },
      default: "viewer",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be active or inactive",
      },
      default: "active",
    },

    // Optional: track last login
    lastLogin: {
      type: Date,
    },

    // Soft delete support (future-proofing)
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;

  return obj;
};

// Prevent fetching deleted users accidentally
userSchema.statics.findActiveUsers = function () {
  return this.find({ isDeleted: false, status: "active" });
};

// Remove duplicate schema index definitions
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
