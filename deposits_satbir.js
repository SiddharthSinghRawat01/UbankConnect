const express = require('express');

const router = express.Router();

const depositsController = require('../controllers/deposits_controller');

router.post('/show_all',depositsController.show);
router.post('/show_by_order',depositsController.searchByOrder);
router.post('/show_by_date',depositsController.searchByDate);
router.post('/show_by_date_range',depositsController.searchByDateRange);
router.get('/convert',depositsController.convertToCsv);
router.post('/filter_record',depositsController.filterRecord);
router.post('/success',depositsController.success);
router.get('/declined',depositsController.declined);
router.get('/refund',depositsController.refund);



module.exports = router;
