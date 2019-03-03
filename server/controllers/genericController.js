const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

require('../models/product')
require('../models/shop')

function bodyCleanser(req, res) {
    if (!('lng' in req.body) || !('lat' in req.body))
        res.status(400).send({
            message: 'lng, lat'
        })
    req.body.location = {
        type: 'Point',
        coordinates: [req.body.lng, req.body.lat]
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
        sort: {
            [req.query.sortKey]: req.query.sortValue
        }
    }
    return options
}

async function getManyController(req, res, next) {
    const Model = mongoose.model(schema)
    const conditions = conditionsBuilder(req)
    const options = optionsBuilder(req)
    try {
        const result = await Model.find(conditions, null, options).exec()
        const total = await Model.countDocuments(conditions).exec()
        res.json({
            start: req.query.start,
            count: req.query.count,
            total: total,
            [endpoint]: result
        })
    } catch (err) {
        next(err)
    }
}

async function postOneController(req, res, next) {
    const Model = mongoose.model(schema)
    if (endpoint === 'shops')
        bodyCleanser(req, res)
    try {
        const result = await Model.create(req.body)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

async function getOneController(req, res, next) {
    const Model = mongoose.model(schema)
    try {
        const result = await Model.findById(req.params.id).exec()
        res.json(result)
    } catch (err) {
        next(err)
    }
}

async function putOneController(req, res, next) {
    const Model = mongoose.model(schema)
    try {
        const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        res.json(result)
    } catch (err) {
        next(err)
    }
}

async function deleteOneController(req, res, next) {
    const Model = mongoose.model(schema)
    const token = req.get('x-observatory-auth')
    const decoded = jsonwebtoken.decode(token)
    try {
        if (decoded.role === 'volunteer')
            await Model.findByIdAndUpdate(req.params.id, {
                withdrawn: true
            }).exec()
        else
            await Model.findByIdAndDelete(req.params.id).exec()
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getManyController,
    postOneController,
    getOneController,
    putOneController,
    deleteOneController
}