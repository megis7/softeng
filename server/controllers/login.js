const bcrypt = require('bcrypt')
const express = require('express')
const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
const util = require('util')

const InternalServerError = require('../error')

const readFile = util.promisify(fs.readFile)
const sign = util.promisify(jsonwebtoken.sign)

require('../models/user')

const User = mongoose.model('User')

async function postController(req, res, next) {
    try {
        const conditions = {
            username: req.body.username
        }
        const user = await User.findOne(conditions).exec()
        if (!user)
            return res.status(404).json({
                message: 'username'
            })
        const same = await bcrypt.compare(req.body.password, user.hash)
        if (!same)
            return res.status(404).json({
                message: 'password'
            })
        const data = await readFile(path.resolve(__dirname, 'secret'))
        const encoded = await sign({
            _id: user._id,
            username: user.username,
            role: user.role,
        }, data, {
            expiresIn: '1d'
        })
        res.json({
            token: encoded
        })
    } catch (err) {
        next(err)
    }
}

module.exports = postController