import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/user.service.js";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const result = await getAllUsers(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user (role/status)
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
export const update = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.id;

    const user = await updateUser(adminId, userId, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const remove = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.id;

    const result = await deleteUser(adminId, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
