const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

const router = express.Router()

require('../models/shop')

const Shop = mongoose.model('Shop')

router.route('/')

    .get((req, res, next) => {
        const start = Number(req.query.start) || 0
        const count = Number(req.query.count) || 20
        const [sortKey, sortValue] = 'sort' in req.query ?
            req.query.sort.split(/\|/) : ['_id', 'DESC']

        let query = Shop.find(null, null, {
            // lean: true,
            skip: start,
            limit: count,
            sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
        })

        if (!('status' in req.query) || req.query.status === 'ACTIVE')
            query.where('withdrawn', false)
        else if (req.query.status === 'WITHDRAWN')
            query.where('withdrawn', true)

        query.exec()
            .then(shops => {
                query = Shop.countDocuments()

                if (!('status' in req.query) || req.query.status === 'ACTIVE')
                    query.where('withdrawn', false)
                else if (req.query.status === 'WITHDRAWN')
                    query.where('withdrawn', true)

                query.exec()
                    .then(total =>
                        res.json({
                            start: start,
                            count: shops.length,
                            total: total,
                            shops: shops
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
        req.body.location = {
            type: 'Point',
            coordinates: [req.body.lng, req.body.lat]
        }
        Shop.create(req.body)
            .then(shop =>
                res.json(shop)
            )
            .catch(err =>
                next(err)
            )
    })

router.route('/:id')

    .get((req, res, next) =>
        Shop.findById(req.params.id).exec()
        .then(shop =>
            res.json(shop)
        )
        .catch(err =>
            next(err)
        )
    )

    .put((req, res, next) => {
        req.body.location = {
            type: 'Point',
            coordinates: [req.body.lng, req.body.lat]
        }
        Shop.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            }).exec()
            .then(shop =>
                res.json(shop)
            )
            .catch(err =>
                next(err)
            )
    })

    .patch((req, res, next) => {
        req.body.location = {
            type: 'Point',
            coordinates: [req.body.lng, req.body.lat]
        }
        Shop.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            }).exec()
            .then(shop =>
                res.json(shop)
            )
            .catch(err =>
                next(err)
            )
    })

    .delete((req, res, next) => {
        const token = req.get('x-observatory-auth')
        const decoded = jsonwebtoken.decode(token)
        if (decoded.role === 'volunteer')
            Shop.findByIdAndUpdate(req.params.id, {
                withdrawn: true
            }).exec()
            .then(() =>
                res.json({
                    message: 'OK'
                })
            )
            .catch(err =>
                next(err)
            )
        else if (decoded.role === 'administrator')
            Shop.findByIdAndDelete(req.params.id).exec()
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