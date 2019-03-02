const mongoose = require('mongoose')

require('../models/price')

const Price = mongoose.model('Price')

function getGeoDist(lng1, lat1, lng2, lat2) {
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLng = deg2rad(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function checkDate(req, next) {
    const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/
    if ('dateFrom' in req.query && 'dateTo' in req.query) {
        if (!dateFormat.test(req.query.dateFrom) || !dateFormat.test(req.query.dateTo))
            return next('date format')
    } else if (!('dateFrom' in req.query) && !('dateTo' in req.query))
        req.query.dateFrom = req.query.dateTo = new Date()
    else
        return next('bad request')
}

function checkGeo(req, res, next) {
    if ('geoLng' in req.query && 'geoLat' in req.query && 'geoDist' in req.query) {
        req.query.geoLng = Number(req.query.geoLng)
        req.query.geoLat = Number(req.query.geoLat)
        req.query.geoDist = Number(req.query.geoDist)
    } else if ('geoLng' in req.query || 'geoLat' in req.query || 'geoDist' in req.query)
        return next(new Error('geoLng, geoLat, geoDist'))
}

function flatten(req, prices) {
    prices = prices.filter(price =>
        price.shopId !== null
    )

    prices.map(price => {
        price.productName = price.productId.name
        price.productTags = price.productId.tags
        price.productId = price.productId._id
        price.shopName = price.shopId.name
        price.shopTags = price.shopId.tags
        price.shopAddress = price.shopId.address
        price.shopDist = 'geoLng' in req.query ?
            getGeoDist(req.query.geoLng, req.query.geoLat, ...price.shopId.location.coordinates) :
            null
        price.shopId = price.shopId._id
        delete price._id
        delete price.__v
    })

    if ('tags' in req.query)
        prices = prices.filter(price => {
            for (tag of req.query.tags)
                if (price.productTags.indexOf(tag) >= 0 || price.shopTags.indexOf(tag) >= 0)
                    return true
            return false
        })

    if ('sort' in req.query) {
        const [sortKey, sortValue] = req.query.sort.split(/\|/)
        if (sortKey === 'geoDist') {
            prices = prices.sort((p1, p2) =>
                sortValue === 'ASC' ?
                p1.shopDist - p2.shopDist :
                p2.shopDist - p1.shopDist
            )
        }
    }

    return prices
}

function queryCleanser(req) {
    req.query.start = parseInt(req.query.start, 10) || 0
    req.query.count = parseInt(req.query.count, 10) || 20;
    [req.query.sortKey, req.query.sortValue] = 'sort' in req.query ?
        req.query.sort.split(/\|/) : ['price', 'ASC']
    delete req.query.sort
}

function bodyCleanser(req) {
    const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/
    if ('dateFrom' in req.body && 'dateTo' in req.body) {
        if (!dateFormat.test(req.body.dateFrom) || !dateFormat.test(req.body.dateTo))
            return next('date format')
    } else
        return next('bad request')

    const dateFrom = new Date(req.body.dateFrom)
    const dateTo = new Date(req.body.dateTo)
    req.body.prices = []
    for (let date = dateFrom; date <= dateTo; date.setDate(date.getDate() + 1)) {
        req.body.date = new Date(date)
        req.body.prices.push(new Price(req.body))
    }
}

function conditionsBuilder(req) {
    const conditions = {
        date: {
            $gte: req.query.dateFrom,
            $lte: req.query.dateTo
        }
    }
    if ('products' in req.query)
        conditions.productId = {
            $in: req.query.products
        }
    if ('shops' in req.query)
        conditions.shopId = {
            $in: req.query.shops
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
    try {
        queryCleanser(req)

        if ('sort' in req.query && sortKey === 'geoDist' && !('geoDist' in req.query))
            return next(new Error('geoDist'))

        checkDate(req, next)
        checkGeo(req, res, next)

        const conditions = conditionsBuilder(req)
        const options = optionsBuilder(req)
        const populateArgument = [{
            path: 'shopId',
            select: '-withdrawn',
            match: 'geoDist' in req.query ? {
                location: {
                    $geoWithin: {
                        $centerSphere: [
                            [req.query.geoLng, req.query.geoLat], req.query.geoDist / 6378.1
                        ]
                    }
                }
            } : true
        }, {
            path: 'productId',
            select: '_id name tags',
        }]

        let prices = await Price.find(conditions, null, options).populate(populateArgument)
        prices = flatten(req, prices)
        const total = await Price.countDocuments(conditions)
        res.json({
            start: req.query.start,
            count: prices.length,
            total: total,
            prices: prices
        })
    } catch (err) {
        next(err)
    }
}

async function postManyController(req, res, next) {
    try {
        bodyCleanser(req)
        const prices = await Price.insertMany(req.body.prices)
        res.json(prices)
    } catch (err) {
        next(err)
    }
}

async function deleteController(req, res, next) {
    try {
        await Price.findByIdAndDelete(req.params.id).exec()
        res.json({
            message: 'OK'
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getController,
    postManyController,
    deleteController
}