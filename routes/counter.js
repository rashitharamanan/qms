const express = require('express');
const router = express.Router();
const { getCounters, addCounter, updateCounter, deleteCounter } = require('../controllers/counterController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('vendor'));

router.route('/')
  .get(getCounters)
  .post(addCounter);

router.route('/:id')
  .put(updateCounter)
  .delete(deleteCounter);

module.exports = router;
