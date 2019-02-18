const bcrypt = require('bcrypt')
const express = require('express')
const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
const util = require('util')

require('../models/user')

const readFile = util.promisify(fs.readFile)
const sign = util.promisify(jsonwebtoken.sign)

const router = express.Router()

const User = mongoose.model('User')

router.post('/', (req, res, next) => {
    User.findOne({
            username: req.body.username
        }).exec()
        .then(user => {
            if (!user)
                res.json({
                    message: 'Incorrect username.'
                })
            else
                bcrypt.compare(req.body.password, user.hash)
                .then(same => {
                    if (!same)
                        res.json({
                            message: 'Incorrect password.'
                        })
                    else
                        readFile(path.resolve(__dirname, 'secret'))
                        .then(data =>
                            sign({
                                _id: user._id,
                                username: user.username,
                                role: user.role,
                            }, data, {
                                expiresIn: '1d'
                            })
                            .then(encoded =>
                                res.json({
                                    token: encoded
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
                .catch(err =>
                    next(err)
                )
        })
        .catch(err =>
            next(err)
        )
})

module.exports = router