const express = require('express')

const usersController = require('../controllers/users')

const router = express.Router()

router.route('/')
    .get(usersController.getManyController)
    .post(usersController.postOneController)

router.route('/:id')
    .get(usersController.getOneController)
    .put(usersController.putOneController)
    .patch(usersController.putOneController)
    .delete(usersController.deleteOneController)

module.exports = router