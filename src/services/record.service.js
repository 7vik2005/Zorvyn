import Record from "../models/record.model.js";
import mongoose from "mongoose";

/**
 * CREATE RECORD
 */
export const createRecord = async (userId, data) => {
  const { amount, type, category, date, note } = data;

  // -------------------------
  // Validation
  // -------------------------
  if (!amount || !type || !category || !date) {
    throw new Error("Amount, type, category, and date are required");
  }

  if (amount < 0) {
    throw new Error("Amount cannot be negative");
  }

  if (!["income", "expense"].includes(type)) {
    throw new Error("Invalid record type");
  }

  // -------------------------
  // Create Record
  // -------------------------
  const record = await Record.create({
    user: userId,
    amount,
    type,
    category,
    date,
    note,
  });

  return record;
};
/**
 * GET RECORDS (with filters, pagination, search)
 */
export const getRecords = async (userId, query) => {
  let {
    page = 1,
    limit = 10,
    type,
    category,
    startDate,
    endDate,
    search,
  } = query;

  // -------------------------
  // Pagination Setup
  // -------------------------
  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  // -------------------------
  // Build Filter Object
  // -------------------------
  const filter = {
    user: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  };

  if (type && ["income", "expense"].includes(type)) {
    filter.type = type;
  }

  if (category) {
    filter.category = category.toLowerCase();
  }

  // Date range filtering
  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }

  // Search (note or category)
  if (search) {
    filter.$or = [
      { note: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  // -------------------------
  // Fetch Data
  // -------------------------
  const records = await Record.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Record.countDocuments(filter);

  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    count: records.length,
    data: records,
  };
};
/**
 * UPDATE RECORD
 */
export const updateRecord = async (userId, recordId, data) => {
  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    throw new Error("Invalid record ID");
  }

  const record = await Record.findOne({
    _id: recordId,
    user: userId,
    isDeleted: false,
  });

  if (!record) {
    throw new Error("Record not found or unauthorized");
  }

  // -------------------------
  // Update Fields
  // -------------------------
  if (data.amount !== undefined) {
    if (data.amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    record.amount = data.amount;
  }

  if (data.type) {
    if (!["income", "expense"].includes(data.type)) {
      throw new Error("Invalid type");
    }
    record.type = data.type;
  }

  if (data.category) {
    record.category = data.category.toLowerCase();
  }

  if (data.date) {
    record.date = new Date(data.date);
  }

  if (data.note !== undefined) {
    record.note = data.note;
  }

  await record.save();

  return record;
};

/**
 * DELETE RECORD (Soft Delete)
 */
export const deleteRecord = async (userId, recordId) => {
  if (!mongoose.Types.ObjectId.isValid(recordId)) {
    throw new Error("Invalid record ID");
  }

  const record = await Record.findOne({
    _id: recordId,
    user: userId,
    isDeleted: false,
  });

  if (!record) {
    throw new Error("Record not found or unauthorized");
  }

  await record.softDelete();

  return { message: "Record deleted successfully" };
};
