const mongoose = require('mongoose')

const priceSchema = new mongoose.Schema({
    price: Number,
    date: Date,
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
})

mongoose.model('Price', priceSchema)