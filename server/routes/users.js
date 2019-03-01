const bcrypt = require('bcrypt')
const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

require('../models/user')

const model = 'User'
const Model = mongoose.model(model)

router.route('/')

    .get((req, res, next) => {
        const start = Number(req.query.start) || 0
        const count = Number(req.query.count) || 20
        const [sortKey, sortValue] = 'sort' in req.query ?
            req.query.sort.split(/\|/) :
            ['_id', 'DESC']

        Model.find(null, null, {
                skip: start,
                limit: count,
                sort: JSON.parse(`{"${sortKey}": "${sortValue}"}`)
            }).exec()
            .then(result => {
                Model.countDocuments().exec()
                    .then(total =>
                        res.json({
                            start: start,
                            count: result.length,
                            total: total,
                            users: result // FIX
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
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                req.body.hash = hash
                Model.create(req.body)
                    .then(model =>
                        res.json(model)
                    )
                    .catch(err =>
                        next(err)
                    )
            })
            .catch(err =>
                next(err)
            )
    })

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

    .put((req, res, next) => {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                req.body.hash = hash
                Model.findByIdAndUpdate(req.params.id, req.body, {
                        runValidators: true,
                        context: 'query',
                        new: true
                    }).exec()
                    .then(model =>
                        res.json(model)
                    )
                    .catch(err =>
                        next(err)
                    )
            })
            .catch(err =>
                next(err)
            )
    })

    .patch((req, res, next) => {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                req.body.hash = hash
                Model.findByIdAndUpdate(req.params.id, req.body, {
                        runValidators: true,
                        context: 'query',
                        new: true
                    }).exec()
                    .then(model =>
                        res.json(model)
                    )
                    .catch(err =>
                        next(err)
                    )
            })
            .catch(err =>
                next(err)
            )
    })

    .delete((req, res, next) => {
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