const express = require('express')
const mongoose = require('mongoose')

require('../models/price')

const router = express.Router()

const Price = mongoose.model('Price')

router.route('/')

    .get((req, res, next) => {
        const start = Number(req.query.start) || 0
        const count = Number(req.query.count) || 20
        const [sortKey, sortValue] = req.query.sort !== undefined ? req.query.sort.split(/\|/) : ['price', 'DESC']
        // /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/

        const dateFrom = req.query.dateFrom !== undefined ? new Date(req.query.dateFrom) : new Date() // FIX
        const dateTo = req.query.dateTo !== undefined ? new Date(req.query.dateTo) : new Date() // FIX

        const geoLng = Number(req.query.geoLng)
        const geoLat = Number(req.query.geoLat)
        const geoDist = Number(req.query.geoDist)

        const query = Price.find({
            // date: {
            //     $gte: dateFrom,
            //     $lte: dateTo
            // }
        }, null, {
            skip: start,
            limit: count,
            sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
        })

        if (req.query.geoLng !== undefined && req.query.geoLat !== undefined && req.query.geoDist !== undefined)
            // query.populate({
            //     path: 'shopId',
            //     match: {
            //         point: {
            //             $near: {
            //                 $geometry: {
            //                     type: "Point",
            //                     coordinates: [geoLng, geoLat]
            //                 },
            //                 $maxDistance: geoDist
            //             }
            //         }
            //     }
            // })
        // else
        query.populate('shopId')
        query.where('shopId.point').within({
            center: [geoLng, geoLat],
            radius: geoDist,
            unique: true,
            spherical: true
        })

        query.populate('productId', '_id name tags').exec()
            .then(result =>
                Price.countDocuments()
                .then(total =>
                    res.json({
                        start: start,
                        count: result.length,
                        total: total,
                        prices: result
                    })
                )
                .catch(err =>
                    next(err)
                )
            )
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