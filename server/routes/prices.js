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

router.route('/')

    .get((req, res, next) => {
        const start = Number(req.query.start) || 0
        const count = Number(req.query.count) || 20
        const [sortKey, sortValue] = req.query.sort !== undefined ? req.query.sort.split(/\|/) : ['price', 'DESC']
        // /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/

        const dateFrom = req.query.dateFrom !== undefined ? new Date(req.query.dateFrom) : new Date() // FIX
        const dateTo = req.query.dateTo !== undefined ? new Date(req.query.dateTo) : new Date() // FIX

        if (req.query.geoLng !== undefined && req.query.geoLat !== undefined && req.query.geoDist !== undefined) {
            var geoLng = Number(req.query.geoLng)
            var geoLat = Number(req.query.geoLat)
            var geoDist = Number(req.query.geoDist)
        }

        const query = Price.find({
            // date: {
            //     $gte: dateFrom,
            //     $lte: dateTo
            // }
        }, null, {
            lean: true,
            skip: start,
            limit: count,
            sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
        })

        // point -> location

        query.populate('shopId', '-withdrawn', 'Shop', {
            point: {
                $geoWithin: {
                    $centerSphere: [
                        [geoLng, geoLat], geoDist / 6378.1
                    ]
                }
            }
        })

        // query.populate('shopId', null, 'Shop', {
        //     point: {
        //         $nearSphere: {
        //             $geometry: {
        //                 type: 'Point',
        //                 coordinates: [geoLng, geoLat]
        //             },
        //             $maxDistance: geoDist * 1000
        //         }
        //     }
        // })

        // if (req.query.geoLng !== undefined && req.query.geoLat !== undefined && req.query.geoDist !== undefined)
        // query.circle('shopId.point', {
        //     center: [geoLng, geoLat],
        //     radius: geoDist / 6378.1,
        //     unique: true,
        //     spherical: true
        // })

        // query.near('shopId.point', {
        //     center: [geoLng, geoLat],
        //     maxDistance: geoDist * 1000,
        //     spherical: true
        // })

        query.populate('productId', '_id name tags').exec()
            .then(prices => {
                prices = prices.filter(price => price.shopId !== null)
                prices.map(price => {
                    price.productName = price.productId.name
                    price.productTags = price.productId.tags
                    price.productId = price.productId._id
                    price.shopName = price.shopId.name
                    price.shopTags = price.shopId.tags
                    price.shopAddress = price.shopId.address
                    price.shopDist = getGeoDist(geoLng, geoLat, ...price.shopId.point.coordinates)
                    price.shopId = price.shopId._id
                    delete price._id
                    delete price.__v
                    return price
                })
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
    })

    .post((req, res, next) => {
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

module.exports = router