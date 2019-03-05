const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

const error = require('../error')

require('../models/product')
require('../models/shop')
require('../models/price')

function bodyCleanser(req, res, next) {
    if (req.endpoint === 'shops') {
        if (!('lng' in req.body) || !('lat' in req.body))
            next(new error.BadRequestError('lng and lat are required'))
        req.body.location = {
            type: 'Point',
            coordinates: [req.body.lng, req.body.lat]
        }
    }
    next()
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
        sort: {
            [req.query.sortKey]: req.query.sortValue
        }
    }
    return options
}

async function getManyController(req, res, next) {
    const Model = mongoose.model(req.schema)
    const conditions = conditionsBuilder(req)
    const options = optionsBuilder(req)
    try {
        const result = await Model.find(conditions, null, options).exec()
        if (!result)
            return next(new error.NotFoundError(req.endpoint))
        const totalCount = await Model.countDocuments(conditions).exec()
        res.json({
            start: req.query.start,
            count: req.query.count,
            total: result.length,
            [req.endpoint]: result,
            totalCount: totalCount
        })
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

async function postOneController(req, res, next) {
    const Model = mongoose.model(req.schema)
    try {
        const result = await Model.create(req.body)
        res.json(result)
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

async function getOneController(req, res, next) {
    const Model = mongoose.model(req.schema)
    try {
        const result = await Model.findById(req.params.id).exec()
        if (!result)
            return next(new error.NotFoundError(req.endpoint))
        res.json(result)
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

async function putOneController(req, res, next) {
    const Model = mongoose.model(req.schema)
    try {
        const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        if (!result)
            return next(new error.NotFoundError(req.endpoint))
        res.json(result)
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

async function patchOneController(req, res, next) {
    const Model = mongoose.model(req.schema)
    try {
        const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        if (!result)
            return next(new error.NotFoundError(req.endpoint))
        res.json(result)
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

async function deleteOneController(req, res, next) {
    const Model = mongoose.model(req.schema)
    const Price = mongoose.model('Price')
    const token = req.get('x-observatory-auth')
    const decoded = jsonwebtoken.decode(token)
    let conditions = {
        _id: req.params.id
    }
    try {
        if (decoded.role === 'volunteer') {
            const result = await Model.updateOne(conditions, {
                withdrawn: true
            }).exec()
            if (result.n === 0)
                return next(new error.NotFoundError(req.endpoint))
        } else if (decoded.role === 'administrator') {
            const result = await Model.deleteOne(conditions).exec()
            if (result.n === 0)
                return next(new error.NotFoundError(req.endpoint))
            const schemaIdKey = req.endpoint.slice(0, req.endpoint.lastIndexOf('s')).concat('Id')
            conditions = {
                [schemaIdKey]: req.params.id
            }
            await Price.deleteMany(conditions).exec()
        }
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

module.exports = {
    bodyCleanser,
    getManyController,
    postOneController,
    getOneController,
    putOneController,
    patchOneController,
    deleteOneController
}