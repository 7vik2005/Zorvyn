import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "../services/record.service.js";

/**
 * @desc    Create a new financial record
 * @route   POST /api/records
 * @access  Private (Admin only)
 */
export const create = async (req, res) => {
  try {
    const userId = req.user.id;

    const record = await createRecord(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create record",
    });
  }
};
/**
 * @desc    Get all records with filters
 * @route   GET /api/records
 * @access  Private (All roles)
 */
export const getAll = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getRecords(userId, req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch records",
    });
  }
};

/**
 * @desc    Update a record
 * @route   PUT /api/records/:id
 * @access  Private (Admin only)
 */
export const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const recordId = req.params.id;

    const record = await updateRecord(userId, recordId, req.body);

    return res.status(200).json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update record",
    });
  }
};
/**
 * @desc    Delete a record (soft delete)
 * @route   DELETE /api/records/:id
 * @access  Private (Admin only)
 */
export const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const recordId = req.params.id;

    const result = await deleteRecord(userId, recordId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete record",
    });
  }
};
