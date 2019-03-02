const express = require('express')

const usersController = require('../controllers/users')

const router = express.Router()

router.route('/')
    .get(usersController.getController)
    .post(usersController.postController)

router.route('/:id')
    .get(usersController.getOneController)
    .put(usersController.putController)
    .patch(usersController.putController)
    .delete(usersController.deleteController)

module.exports = router