const express = require('express')

const genericController = require('../controllers/genericController')

const router = express.Router()

router.route('/')
    .get(genericController.getManyController)
    .post(genericController.postOneController)

router.route('/:id')
    .get(genericController.getOneController)
    .put(genericController.putOneController)
    .patch(genericController.patchOneController)
    .delete(genericController.deleteOneController)

module.exports = router