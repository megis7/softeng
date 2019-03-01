const mongoose = require('mongoose')
const mongooseIdValidator = require('mongoose-id-validator')

// const dateFormat = /^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/

const priceSchema = new mongoose.Schema({
    price: {
        required: true,
        type: Number
    },
    date: {
        required: true,
        type: Date,
        // validate: {
        //     validator: date =>
        //         dateFormat.test(date)
        // }
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
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
})

priceSchema.plugin(mongooseIdValidator)

mongoose.model('Price', priceSchema)