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

function authenticatedUser(req, res, next) {
    const token = req.get('x-observatory-auth')
    if (!token)
        res.status(403).json({
            message: 'Incorrect token.'
        })
    else
        readFile(path.resolve(__dirname, 'routes/secret'))
        .then(data =>
            verify(token, data)
            .then(() =>
                next()
            )
            .catch(err =>
                res.status(403).json({
                    message: err
                })
            )
        )
        .catch(err =>
            next(err)
        )

}

app.use((req, res, next) => {
    if (req.query.format == 'xml')
        res.status(400).send()
    else
        next()
})

app.post(/\/product|\/shops|\/prices/, (req, res, next) =>
    authenticatedUser(req, res, next)
)
app.put('*', (req, res, next) =>
    authenticatedUser(req, res, next)
)
app.patch('*', (req, res, next) =>
    authenticatedUser(req, res, next)
)
app.delete('*', (req, res, next) =>
    authenticatedUser(req, res, next)
)

app.use('/observatory/api/login', loginRouter)
app.use('/observatory/api/logout', logoutRouter)
app.use('/observatory/api/users', usersRouter)
app.use('/observatory/api/products', productsRouter)
app.use('/observatory/api/shops', shopsRouter)
app.use('/observatory/api/prices', pricesRouter)

module.exports = app