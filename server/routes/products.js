const express = require('express')

const productsController = require('../controllers/products')

const router = express.Router()

router.route('/')
    .get(productsController.getController)
    .post(productsController.postController)

router.route('/:id')
    .get(productsController.getOneController)
    .put(productsController.putController)
    .patch(productsController.putController)
    .delete(productsController.deleteController)

module.exports = router