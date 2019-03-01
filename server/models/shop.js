const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    address: {
        required: true,
        type: String
    },
    location: { // required
        coordinates: [Number],
        type: {
            type: String,
            enum: ['Point']
        }
    },
    tags: {
        required: true,
        type: [String]
    },
    withdrawn: {
        default: false,
        type: Boolean
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