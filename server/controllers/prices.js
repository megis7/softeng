const mongoose = require('mongoose')

const error = require('../error')

require('../models/price')

const Price = mongoose.model('Price')

const R = 6371 / 1.6

function checkDate(req, res, next) {
    if ('dateFrom' in req.query && 'dateTo' in req.query) {
        const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/
        if (!dateFormat.test(req.query.dateFrom) || !dateFormat.test(req.query.dateTo))
            next(new error.BadRequestError('date format must conform to ISO standards'))
        else
            next()
    } else if (!('dateFrom' in req.query) && !('dateTo' in req.query)) {
        req.query.dateFrom = req.query.dateTo = new Date()
        next()
    } else
        next(new error.BadRequestError('either both dateFrom and dateTo must be specified or neither'))
}

function checkGeo(req, res, next) {
    if ('geoLng' in req.query && 'geoLat' in req.query && 'geoDist' in req.query) { // all
        req.query.geoLng = Number(req.query.geoLng)
        req.query.geoLat = Number(req.query.geoLat)
        req.query.geoDist = Number(req.query.geoDist)
        next()
    } else if ('geoLng' in req.query || 'geoLat' in req.query || 'geoDist' in req.query) // any
        next(new error.BadRequestError('either all of geoLng, geoLat and geoDist must be specified or none'))
    else if (req.query.sortKey === 'geoDist') // none
        next(new error.BadRequestError('geoLng and geoLat must be specified in order to sort by geoDist'))
    else
        next()
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
        lean: true,
        sort: {
            [req.query.sortKey]: req.body.sortValue
        }
    }
    return options
}

async function getManyController(req, res, next) {
    try {
        const conditions = conditionsBuilder(req)
        const options = optionsBuilder(req)

        const productMatch = {
            withdrawn: false
        }
        const shopMatch = {
            withdrawn: false
        }
        if ('geoDist' in req.query)
            shopMatch.location = {
                $geoWithin: {
                    $centerSphere: [
                        [req.query.geoLng, req.query.geoLat], req.query.geoDist / R
                    ]
                }
            }

        const populateArgument = [{
            path: 'productId',
            select: '_id name tags',
            match: productMatch
        }, {
            path: 'shopId',
            select: '-withdrawn',
            match: shopMatch
        }]

        let prices = await Price.find(conditions, null, options).populate(populateArgument).exec()
        prices = myFilter(req, prices)
        if (!prices)
            return next(new error.NotFoundError('prices'))

        res.json({
            start: req.query.start,
            count: req.query.count,
            total: prices.length,
            prices: prices.slice(req.query.start, req.query.start + req.query.count)
        })
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

function bodyCleanser(req, res, next) {
    const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/
    if ('dateFrom' in req.body && 'dateTo' in req.body) {
        if (!dateFormat.test(req.body.dateFrom) || !dateFormat.test(req.body.dateTo))
            next(new error.BadRequestError('date format must conform to ISO standards'))
        else if (new Date(req.body.dateTo) - new Date(req.body.dateFrom) > 30 * (24 * 60 * 60 * 1000))
            next(new error.BadRequestError('dare range is restricted to one month'))
        else {
            req.body.dateFrom = new Date(req.body.dateFrom)
            req.body.dateTo = new Date(req.body.dateTo)
            next()
        }
    } else
        next(new error.BadRequestError('dateFrom and dateTo are required'))
}

async function postManyController(req, res, next) {
    try {
        let conditions = {
            productId: req.body.productId,
            shopId: req.body.shopId
        }
        let prices = []
        for (let date = req.body.dateFrom; date <= req.body.dateTo; date.setDate(date.getDate() + 1)) {
            conditions.date = req.body.date = date
            prices.push(await Price.findOneAndUpdate(conditions, req.body, {
                new: true,
                upsert: true
            }))
        }
        res.json({
            start: 0,
            count: prices.length,
            total: prices.length,
            prices: prices
        })
    } catch (err) {
        next(new error.BadRequestError(err))
    }
}

function getGeoDist(lng1, lat1, lng2, lat2) {
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

function myFilter(req, prices) {
    prices = prices.filter(price =>
        price.shopId !== null && price.productId !== null
    )

    prices.map(price => {
        price.date = price.date.toISOString().split('T')[0]
        price.productName = price.productId.name
        price.productTags = price.productId.tags
        price.shopName = price.shopId.name
        price.shopTags = price.shopId.tags
        price.shopAddress = price.shopId.address
        price.shopDist = 'geoDist' in req.query ?
            getGeoDist(req.query.geoLng, req.query.geoLat, ...price.shopId.location.coordinates) :
            null;
        [price.shopLng, price.shopLat] = price.shopId.location.coordinates
        price.productId = price.productId._id
        price.shopId = price.shopId._id
        delete price._id
        delete price.__v
    })

    if ('tags' in req.query)
        prices = prices.filter(price => {
            if (req.query.tags instanceof Array) {
                for (tag of req.query.tags)
                    if (price.productTags.indexOf(tag) >= 0 || price.shopTags.indexOf(tag) >= 0)
                        return true
            } else if (price.productTags.indexOf(req.query.tags) >= 0 || price.shopTags.indexOf(req.query.tags) >= 0)
                return true
            return false
        })

    if ('sort' in req.query) {
        const [sortKey, sortValue] = req.query.sort.split(/\|/)
        if (sortKey === 'geoDist')
            prices = prices.sort((p1, p2) =>
                sortValue === 'ASC' ?
                p1[sortKey] - p2[sortKey] :
                p2[sortKey] - p1[sortKey]
            )
    }

    return prices
}

module.exports = {
    checkGeo,
    checkDate,
    getManyController,
    bodyCleanser,
    postManyController
}