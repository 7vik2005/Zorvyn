import Record from "../models/record.model.js";
import mongoose from "mongoose";

/**
 * Utility: Escape special regex characters from user input
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Utility: Validate and clamp pagination params
 */
const sanitizePagination = (page, limit) => {
  let p = parseInt(page) || 1;
  let l = parseInt(limit) || 10;

  // Clamp to safe bounds
  if (p < 1) p = 1;
  if (l < 1) l = 1;
  if (l > 100) l = 100; // prevent excessive data fetches

  return { page: p, limit: l };
};

/**
 * CREATE RECORD
 */
export const createRecord = async (userId, data) => {
  const { amount, type, category, date, note } = data;

  // Validation
  if (amount === undefined || amount === null) {
    throw new Error("Amount is required");
  }

  if (!type || !category || !date) {
    throw new Error("Type, category, and date are required");
  }

  // Numeric validation
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount)) {
    throw new Error("Amount must be a valid number");
  }

  if (parsedAmount < 0) {
    throw new Error("Amount cannot be negative");
  }

  if (!["income", "expense"].includes(type)) {
    throw new Error("Invalid record type. Must be 'income' or 'expense'");
  }

  // Category validation
  if (typeof category !== "string" || category.trim().length === 0) {
    throw new Error("Category must be a non-empty string");
  }

  // Date validation
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  // Note validation (optional field)
  if (note !== undefined && note !== null) {
    if (typeof note !== "string") {
      throw new Error("Note must be a string");
    }
    if (note.length > 200) {
      throw new Error("Note cannot exceed 200 characters");
    }
  }

  // Create Record
  const record = await Record.create({
    user: userId,
    amount: parsedAmount,
    type,
    category: category.trim().toLowerCase(),
    date: parsedDate,
    note: note ? note.trim() : undefined,
  });

  return record;
};

/**
 * GET RECORDS (with filters, pagination, search)
 */
export const getRecords = async (userId, query) => {
  let {
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    search,
    sort: sortParam,
  } = query;

  // Pagination Setup (NaN-safe with clamping)
  const pagination = sanitizePagination(page, limit);
  page = pagination.page;
  limit = pagination.limit;

  const skip = (page - 1) * limit;

  // Build Filter Object
  const filter = {
    user: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  };

  if (type && ["income", "expense"].includes(type)) {
    filter.type = type;
  }

  if (category) {
    filter.category = category.toLowerCase().trim();
  }

  // Date range filtering with validation
  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      const parsedStart = new Date(startDate);
      if (!isNaN(parsedStart.getTime())) {
        filter.date.$gte = parsedStart;
      }
    }

    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (!isNaN(parsedEnd.getTime())) {
        filter.date.$lte = parsedEnd;
      }
    }

    // Remove empty date filter if both dates were invalid
    if (Object.keys(filter.date).length === 0) {
      delete filter.date;
    }
  }

  // Search (note or category) — with regex escaping
  if (search && typeof search === "string" && search.trim().length > 0) {
    const safeSearch = escapeRegex(search.trim().substring(0, 100)); // limit length
    filter.$or = [
      { note: { $regex: safeSearch, $options: "i" } },
      { category: { $regex: safeSearch, $options: "i" } },
    ];
  }

  // Sorting
  let sortOrder = { date: -1 }; // default: newest first
  if (sortParam) {
    const allowedSortFields = ["date", "amount", "type", "category", "createdAt"];
    const sortField = sortParam.replace(/^-/, "");
    if (allowedSortFields.includes(sortField)) {
      sortOrder = { [sortField]: sortParam.startsWith("-") ? -1 : 1 };
    }
  }

  // Fetch Data
  const records = await Record.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit);

  const total = await Record.countDocuments(filter);

  return {
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
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

  // Update Fields
  if (data.amount !== undefined) {
    const parsedAmount = Number(data.amount);
    if (isNaN(parsedAmount)) {
      throw new Error("Amount must be a valid number");
    }
    if (parsedAmount < 0) {
      throw new Error("Amount cannot be negative");
    }
    record.amount = parsedAmount;
  }

  if (data.type) {
    if (!["income", "expense"].includes(data.type)) {
      throw new Error("Invalid type. Must be 'income' or 'expense'");
    }
    record.type = data.type;
  }

  if (data.category) {
    if (typeof data.category !== "string" || data.category.trim().length === 0) {
      throw new Error("Category must be a non-empty string");
    }
    record.category = data.category.trim().toLowerCase();
  }

  if (data.date) {
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    record.date = parsedDate;
  }

  if (data.note !== undefined) {
    if (data.note !== null && typeof data.note !== "string") {
      throw new Error("Note must be a string");
    }
    if (data.note && data.note.length > 200) {
      throw new Error("Note cannot exceed 200 characters");
    }
    record.note = data.note ? data.note.trim() : data.note;
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
