import mongoose from "mongoose";

/**
 * Allowed values
 */
const RECORD_TYPES = ["income", "expense"];

/**
 * Record Schema
 */
const recordSchema = new mongoose.Schema(
  {
    // User Reference (Owner of the record)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    // Type (Income / Expense)
    type: {
      type: String,
      enum: {
        values: RECORD_TYPES,
        message: "Type must be either income or expense",
      },
      required: true,
      index: true,
    },

    // Category (Flexible)
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // Date of transaction
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },

    // Notes / Description
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note cannot exceed 200 characters"],
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * INDEXES (VERY IMPORTANT for performance)
 */

// Compound index for filtering
recordSchema.index({ user: 1, date: -1 });

// For dashboard aggregation
recordSchema.index({ user: 1, type: 1 });

// Category-based queries
recordSchema.index({ user: 1, category: 1 });

/**
 * STATIC METHODS
 */

// Get active (non-deleted) records
recordSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

/**
 * INSTANCE METHODS
 */

// Soft delete a record
recordSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

/**
 * CLEAN OUTPUT
 */

recordSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.isDeleted;
  return obj;
};
const Record = mongoose.model("Record", recordSchema);

export default Record;
