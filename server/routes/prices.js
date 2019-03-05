const express = require('express')

const pricesController = require('../controllers/prices')

const router = express.Router()

router.route('/')
    .get([pricesController.checkGeo, pricesController.checkDate, pricesController.getManyController])
    .post([pricesController.bodyCleanser, pricesController.postManyController])

module.exports = router