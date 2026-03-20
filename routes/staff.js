const express = require('express');
const router = express.Router();
const { getStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('vendor'));

router.route('/')
  .get(getStaff)
  .post(addStaff);

router.route('/:id')
  .put(updateStaff)
  .delete(deleteStaff);

module.exports = router;
