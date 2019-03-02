const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

require('../models/product')

const Product = mongoose.model('Product')

function queryCleanser(req) {
    req.query.start = parseInt(req.query.start, 10) || 0
    req.query.count = parseInt(req.query.count, 10) || 20;
    [req.query.sortKey, req.query.sortValue] = 'sort' in req.query ?
        req.query.sort.split(/\|/) : ['_id', 'DESC']
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
        const products = await Product.find(conditions, null, options).exec()
        const total = await Product.countDocuments(conditions).exec()
        res.json({
            start: req.query.start,
            count: products.length,
            total: total,
            products: products
        })
    } catch (err) {
        next(err)
    }
}

async function postController(req, res, next) {
    try {
        const product = await Product.create(req.body)
        res.json(product)
    } catch (err) {
        next(err)
    }
}

async function getOneController(req, res, next) {
    try {
        const product = await Product.findById(req.params.id).exec()
        res.json(product)
    } catch (err) {
        next(err)
    }
}

async function putController(req, res, next) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        res.json(product)
    } catch (err) {
        next(err)
    }
}

async function deleteController(req, res, next) {
    const token = req.get('x-observatory-auth')
    const decoded = jsonwebtoken.decode(token)
    try {
        if (decoded.role === 'volunteer')
            await Product.findByIdAndUpdate(req.params.id, {
                withdrawn: true
            }).exec()
        else
            await Product.findByIdAndDelete(req.params.id).exec()
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