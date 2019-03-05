const mongoose = require('mongoose')
const mongooseIdValidator = require('mongoose-id-validator')

const priceSchema = new mongoose.Schema({
    price: {
        required: true,
        type: Number
    },
    date: {
        required: true,
        type: Date
    },
    productId: {
        ref: 'Product',
        required: true,
        type: mongoose.Schema.Types.ObjectId
    },
    shopId: {
        ref: 'Shop',
        required: true,
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.date = ret.date.toISOString().split('T')[0]
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
})

priceSchema.plugin(mongooseIdValidator)

mongoose.model('Price', priceSchema)