const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

require('../models/shop')

const Shop = mongoose.model('Shop')

function queryCleanser(req) {
    req.query.start = parseInt(req.query.start, 10) || 0
    req.query.count = parseInt(req.query.count, 10) || 20;
    [req.query.sortKey, req.query.sortValue] = 'sort' in req.query ?
        req.query.sort.split(/\|/) : ['_id', 'DESC']
}

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
        sort: JSON.parse(`{"${req.query.sortKey}": "${req.query.sortValue}"}`)
    }
    return options
}

async function getController(req, res, next) {
    queryCleanser(req)
    const conditions = conditionsBuilder(req)
    const options = optionsBuilder(req)
    try {
        const shops = await Shop.find(conditions, null, options).exec()
        const total = await Shop.countDocuments(conditions).exec()
        res.json({
            start: req.query.start,
            count: shops.length,
            total: total,
            shops: shops
        })
    } catch (err) {
        next(err)
    }
}

async function postController(req, res, next) {
    bodyCleanser(req, res)
    try {
        const shop = await Shop.create(req.body)
        res.json(shop)
    } catch (err) {
        next(err)
    }
}

async function getOneController(req, res, next) {
    try {
        const shop = await Shop.findById(req.params.id).exec()
        res.json(shop)
    } catch (err) {
        next(err)
    }
}

async function putController(req, res, next) {
    bodyCleanser(req, res)
    try {
        const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        res.json(shop)
    } catch (err) {
        next(err)
    }
}

async function deleteController(req, res, next) {
    const token = req.get('x-observatory-auth')
    const decoded = jsonwebtoken.decode(token)
    try {
        if (decoded.role === 'volunteer')
            await Shop.findByIdAndUpdate(req.params.id, {
                withdrawn: true
            }).exec()
        else
            await Shop.findByIdAndDelete(req.params.id).exec()
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getController,
    postController,
    getOneController,
    putController,
    putController,
    deleteController
}