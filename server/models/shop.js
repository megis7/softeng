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
})

mongoose.model('Shop', shopSchema)