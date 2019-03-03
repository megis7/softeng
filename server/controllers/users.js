const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const error = require('../error')

require('../models/user')

const User = mongoose.model('User')

async function bodyCleanser(req, res, next) {
    try {
        req.body.hash = await bcrypt.hash(req.body.password, 10)
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

function optionsBuilder(req) {
    const options = {
        skip: req.query.start,
        limit: req.query.count,
        sort: {
            [req.query.sortKey]: req.query.sortValue
        }
    }
    return options
}

async function getManyController(req, res, next) {
    const options = optionsBuilder(req)
    try {
        const users = await User.find(null, null, options).exec()
        const total = await User.countDocuments().exec()
        res.json({
            start: req.query.start,
            count: users.length,
            total: total,
            users: users
        })
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

async function postOneController(req, res, next) {
    await bodyCleanser(req, res, next)
    try {
        const user = await User.create(req.body)
        res.json(user)
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

async function getOneController(req, res, next) {
    try {
        const user = await User.findById(req.params.id).exec()
        res.json(user)
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

async function putOneController(req, res, next) {
    await bodyCleanser(req, res, next)
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            context: 'query',
            new: true
        }).exec()
        res.json(user)
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

async function deleteOneController(req, res, next) {
    const conditions = {
        _id: req.params.id
    }
    try {
        await User.deleteOne(conditions).exec()
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(new error.InternalServerError(err))
    }
}

module.exports = {
    getManyController,
    postOneController,
    getOneController,
    putOneController,
    deleteOneController
}