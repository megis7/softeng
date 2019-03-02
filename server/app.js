const express = require('express')
const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')
const util = require('util')

const loginRouter = require('./routes/login')
const logoutRouter = require('./routes/logout')
const usersRouter = require('./routes/users')
const productsRouter = require('./routes/products')
const shopsRouter = require('./routes/shops')
const pricesRouter = require('./routes/prices')

const InternalServerError = require('./error')

mongoose.connect('mongodb://localhost/server', {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
})

const readFile = util.promisify(fs.readFile)
const verify = util.promisify(jsonwebtoken.verify)

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use(express.static(path.join(__dirname, 'public')))

async function authenticatedUser(req, res, next) {
    try {
        const token = req.get('x-observatory-auth')
        const data = await readFile(path.resolve(__dirname, 'controllers/secret'))
        await verify(token, data)
        next()
    } catch (err) {
        next(err)
    }
}

app.use((req, res, next) => {
    if (req.query.format == 'xml')
        next(new Error('xml'))
    else
        next()
})

function cleanseInput(req) {
    delete req.body.withdrawn
    delete req.body._id
}

app.get('*', (req, res, next) => {
    if ('sort' in req.query)
        req.query.sort = req.query.sort.replace(/id/, '_id')
    next()
})

app.post(/\/product|\/shops|\/prices/, (req, res, next) => {
    cleanseInput(req)
    authenticatedUser(req, res, next)
})
app.put('*', (req, res, next) => {
    cleanseInput(req)
    authenticatedUser(req, res, next)
})
app.patch('*', (req, res, next) => {
    cleanseInput(req)
    authenticatedUser(req, res, next)
})
app.delete('*', (req, res, next) =>
    authenticatedUser(req, res, next)
)

app.use('/observatory/api/login', loginRouter)
app.use('/observatory/api/logout', logoutRouter)
app.use('/observatory/api/users', usersRouter)
app.use('/observatory/api/products', productsRouter)
app.use('/observatory/api/shops', shopsRouter)
app.use('/observatory/api/prices', pricesRouter)

app.use((err, req, res, next) => {
    console.error(err.stack)
    if (err instanceof InternalServerError)
        res.status(500).json({
            name: err.name,
        })
    else
        res.status(400).json({
            // constructor: err.constructor,
            name: err.name,
            message: err.message
        })
})

module.exports = app