const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    tags: [String],
    withdrawn: {
        type: Boolean,
        default: false
    }
})

mongoose.model('Product', productSchema)