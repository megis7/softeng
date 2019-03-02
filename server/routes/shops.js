const express = require('express')

const shopsController = require('../controllers/shops')

const router = express.Router()

router.route('/')
    .get(shopsController.getController)
    .post(shopsController.postController)

router.route('/:id')
    .get(shopsController.getOneController)
    .put(shopsController.putController)
    .patch(shopsController.putController)
    .delete(shopsController.deleteController)

module.exports = router