const express = require('express')
const mongoose = require('mongoose')

require('../models/price')

const router = express.Router()

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
        req.query.dateFrom = req.query.dateTo = new Date() // FIX
    else
        return next('bad request')
}

function checkGeo(req, res, next) {
    if ('geoLng' in req.query && 'geoLat' in req.query && 'geoDist' in req.query) {
        req.query.geoLng = Number(req.query.geoLng)
        req.query.geoLat = Number(req.query.geoLat)
        req.query.geoDist = Number(req.query.geoDist)


    } else if ('geoLng' in req.query || 'geoLat' in req.query || 'geoDist' in req.query) {
        res.status(400).json({
            message: 'geoLng, geoLat, geoDist'
        })
        // return next('bad request')
    }
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
            for (tag of req.query.tags.split(','))
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

function conditionBuilder(req) {
    const conditions = {
        date: {
            $gte: req.query.dateFrom,
            $lte: req.query.dateTo
        }
    }
    if ('products' in req.query)
        conditions.productId = {
            $in: req.query.products.split(',')
        }
    if ('shops' in req.query)
        conditions.shopId = {
            $in: req.query.shops.split(',')
        }
    return conditions
}

router.route('/')

    .get((req, res, next) => {
        const start = Number(req.query.start) || 0
        const count = Number(req.query.count) || 20
        const [sortKey, sortValue] = 'sort' in req.query ?
            req.query.sort.split(/\|/) : ['price', 'ASC']

        if ('sort' in req.query && sortKey === 'geoDist' && !('geoDist' in req.query))
            return next('how can i sort, if i don\'t know where you are, duh')

        checkDate(req, next)
        checkGeo(req, res, next)

        Price.find(conditionBuilder(req), null, {
                lean: true,
                skip: start,
                limit: count,
                sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
            }).exec()
            .then(prices =>
                Price.populate(prices, [{
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
                }])
                // .execPopulate()
                .then(prices => {
                    prices = flatten(req, prices)
                    Price.countDocuments()
                        .then(total =>
                            res.json({
                                start: start,
                                count: prices.length,
                                total: total,
                                prices: prices
                            })
                        )
                        .catch(err =>
                            next(err)
                        )
                })
                .catch(err =>
                    next(err)
                )
            )
            .catch(err =>
                next(err)
            )
    })


    // query.populate('shopId', null, 'Shop', {
    //     location: {
    //         $nearSphere: {
    //             $geometry: {
    //                 type: 'Point',
    //                 coordinates: [req.query.geoLng, req.query.geoLat]
    //             },
    //             $maxDistance: req.query.geoDist * 1000
    //         }
    //     }
    // })

    // query.circle('shopId.location', {
    //     center: [req.query.geoLng, req.query.geoLat],
    //     radius: req.query.geoDist / 6378.1,
    //     unique: true,
    //     spherical: true
    // })

    // query.near('shopId.location', {
    //     center: [req.query.geoLng, req.query.geoLat],
    //     maxDistance: req.query.geoDist * 1000,
    //     spherical: true
    // })

    .post((req, res, next) => {
        const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/
        if ('dateFrom' in req.body && 'dateTo' in req.body) {
            if (!dateFormat.test(req.body.dateFrom) || !dateFormat.test(req.body.dateTo))
                return next('date format')
        } else
            return next('bad request')

        let prices = []
        const dateFrom = new Date(req.body.dateFrom)
        const dateTo = new Date(req.body.dateTo)
        for (let date = dateFrom; date <= dateTo; date.setDate(date.getDate() + 1)) {
            req.body.date = new Date(date)
            prices.push(new Price(req.body))
        }
        Price.insertMany(prices)
            .then(result =>
                res.json(result)
            )
            .catch(err =>
                next(err)
            )
    })

router.route('/:id')

    .delete((req, res, next) => {
        Price.findByIdAndDelete(req.params.id).exec()
            .then(() =>
                res.json({
                    message: 'OK'
                })
            )
            .catch(err =>
                next(err)
            )
    })

module.exports = router