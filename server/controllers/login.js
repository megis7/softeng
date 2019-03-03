const bcrypt = require('bcrypt')
const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
const util = require('util')

const error = require('../error')
require('../models/user')

const readFile = util.promisify(fs.readFile)
const sign = util.promisify(jsonwebtoken.sign)

const User = mongoose.model('User')

async function postController(req, res, next) {
    try {
        const conditions = {
            username: req.body.username
        }
        const user = await User.findOne(conditions).exec()
        if (!user)
            return next(new error.NotFoundError('username'))
        const same = await bcrypt.compare(req.body.password, user.hash)
        if (!same)
            return next(new error.NotFoundError('password'))
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
        next(new error.InternalServerError(err))
    }
}

module.exports = postController