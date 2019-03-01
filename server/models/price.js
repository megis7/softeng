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
}, {
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    },
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
})

mongoose.model('Price', priceSchema)