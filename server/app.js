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
const pricesRouter = require('./routes/prices')
const genericRouter = require('./routes/genericRouter')

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

function bodyCleanser(req) {
    delete req.body.withdrawn
    delete req.body._id
}

function queryCleanser(req) {
    req.query.start = Number(req.query.start) || 0
    req.query.count = Number(req.query.count) || 20;
    [req.query.sortKey, req.query.sortValue] = 'sort' in req.query ?
        req.query.sort.replace(/id/, '_id').split(/\|/) :
        (endpoint === 'prices' ? ['price', 'ASC'] : ['_id', 'DESC'])
}

app.use((req, res, next) => {
    endpoint = req.originalUrl.split('/')[3].split('?')[0]
    schema = endpoint.replace(endpoint[0], endpoint[0].toUpperCase()).slice(0, endpoint.lastIndexOf('s'))
    next()
})

app.get(/.*/, (req, res, next) => {
    queryCleanser(req)
    next()
})

app.post(/\/products|\/shops|\/prices/, (req, res, next) => {
    bodyCleanser(req)
    authenticatedUser(req, res, next)
})

app.put(/.*/, (req, res, next) => {
    bodyCleanser(req)
    authenticatedUser(req, res, next)
})
app.patch(/.*/, (req, res, next) => {
    bodyCleanser(req)
    authenticatedUser(req, res, next)
})
app.delete(/.*/, (req, res, next) =>
    authenticatedUser(req, res, next)
)

app.use('/observatory/api/login', loginRouter)
app.use('/observatory/api/logout', logoutRouter)
app.use('/observatory/api/users', usersRouter)
app.use('/observatory/api/products', genericRouter)
app.use('/observatory/api/shops', genericRouter)
app.use('/observatory/api/prices', pricesRouter)

app.use((err, req, res, next) => {
    console.error(err.stack)
    if (err instanceof InternalServerError)
        res.status(500).json({
            name: err.name,
        })
    else
        res.status(400).json({
            name: err.name,
            message: err.message
        })
})

module.exports = app