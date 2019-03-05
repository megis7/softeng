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
    location: {
        coordinates: {
            type: [Number]
        },
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
    toJSON: {
        transform: (doc, ret) => {
            [ret.lng, ret.lat] = ret.location.coordinates
            delete ret.location
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
})

mongoose.model('Shop', shopSchema)