const express = require('express')

const pricesController = require('../controllers/prices')

const router = express.Router()

router.route('/')
    .get(pricesController.getController)
    .post(pricesController.postManyController)

router.route('/:id')
    .delete(pricesController.deleteController)

module.exports = router