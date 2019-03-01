const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')

const router = express.Router()

require('../models/product')

const model = 'Product'
const Model = mongoose.model(model)

router.route('/')

    .get((req, res, next) => {
        const start = parseInt(req.query.start, 10) || 0
        const count = parseInt(req.query.count, 10) || 20
        const [sortKey, sortValue] = 'sort' in req.query ?
            req.query.sort.split(/\|/) :
            ['_id', 'DESC']

        let query = Model.find(null, null, {
            skip: start,
            limit: count,
            sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
        })

        if (!('status' in req.query) || req.query.status === 'ACTIVE')
            query.where('withdrawn', false)
        else if (req.query.status === 'WITHDRAWN')
            query.where('withdrawn', true)

        query.exec()
            .then(result => {
                query = Model.countDocuments()

                if (!('status' in req.query) || req.query.status === 'ACTIVE')
                    query.where('withdrawn', false)
                else if (req.query.status === 'WITHDRAWN')
                    query.where('withdrawn', true)

                query.exec()
                    .then(total =>
                        res.json({
                            start: start,
                            count: result.length,
                            total: total,
                            products: result
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

    .post((req, res, next) =>
        Model.create(req.body)
        .then(model =>
            res.json(model)
        )
        .catch(err =>
            next(err)
        )
    )

router.route('/:id')

    .get((req, res, next) =>
        Model.findById(req.params.id).exec()
        .then(result =>
            res.json(result)
        )
        .catch(err =>
            next(err)
        )
    )

    .put((req, res, next) =>
        Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        .then(result =>
            res.json(result)
        )
        .catch(err =>
            next(err)
        )
    )

    .patch((req, res, next) =>
        Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).exec()
        .then(result =>
            res.json(result)
        )
        .catch(err =>
            next(err)
        )
    )

    .delete((req, res, next) => {
        const token = req.get('x-observatory-auth')
        const decoded = jsonwebtoken.decode(token)
        if (decoded.role === 'volunteer')
            Model.findByIdAndUpdate(req.params.id, {
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
            Model.findByIdAndDelete(req.params.id).exec()
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