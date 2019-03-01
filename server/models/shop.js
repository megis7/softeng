const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
    name: String,
    address: String,
    point: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number]
    },
    tags: [String],
    withdrawn: {
        type: Boolean,
        default: false
    }
}, {
    // id: true
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

mongoose.model('Shop', shopSchema)