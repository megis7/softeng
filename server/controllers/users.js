const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

require('../models/user')

const User = mongoose.model('User')

function queryCleanser(req) {
    req.query.start = parseInt(req.query.start, 10) || 0
    req.query.count = parseInt(req.query.count, 10) || 20;
    [req.query.sortKey, req.query.sortValue] = 'sort' in req.query ?
        req.query.sort.split(/\|/) : ['_id', 'DESC']
}

async function bodyCleanser(req, res, next) {
    try {
        req.body.hash = await bcrypt.hash(req.body.password, 10)
    } catch (err) {
        next(err)
    }
}

function conditionsBuilder(req) {
    let conditions
    if (!('status' in req.query) || req.query.status === 'ACTIVE')
        conditions = {
            withdrawn: false
        }
    else if (req.query.status === 'WITHDRAWN')
        conditions = {
            withdrawn: true
        }
    return conditions
}

function optionsBuilder(req) {
    const options = {
        skip: req.query.start,
        limit: req.query.count,
        sort: JSON.parse(`{"${req.query.sortKey}": "${req.query.sortValue}"}`)
    }
    return options
}

async function getController(req, res, next) {
    queryCleanser(req)
    const conditions = conditionsBuilder(req)
    const options = optionsBuilder(req)
    try {
        const users = await User.find(conditions, null, options).exec()
        const total = await User.countDocuments(conditions).exec()
        res.json({
            start: req.query.start,
            count: users.length,
            total: total,
            users: users
        })
    } catch (err) {
        next(err)
    }
}

async function postController(req, res, next) {
    await bodyCleanser(req, res, next)
    try {
        const user = await User.create(req.body)
        res.json(user)
    } catch (err) {
        next(err)
    }
}

async function getOneController(req, res, next) {
    try {
        const user = await User.findById(req.params.id).exec()
        res.json(user)
    } catch (err) {
        next(err)
    }
}

async function putController(req, res, next) {
    await bodyCleanser(req, res, next)
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            context: 'query',
            new: true
        }).exec()
        res.json(user)
    } catch (err) {
        next(err)
    }
}

async function deleteController(req, res, next) {
    try {
        await User.findByIdAndUpdate(req.params.id).exec()
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = module.exports = {
    getController,
    postController,
    getOneController,
    putController,
    putController,
    deleteController
}