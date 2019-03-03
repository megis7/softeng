const express = require('express')

const pricesController = require('../controllers/prices')

const router = express.Router()

router.route('/')
    .get(pricesController.getManyController)
    .post(pricesController.postManyController)

module.exports = router