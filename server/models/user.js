const mongoose = require('mongoose')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    hash: String,
    role: {
        type: String,
        required: true,
        enum: ['volunteer', 'administrator']
    }
})

userSchema.plugin(mongooseUniqueValidator)

mongoose.model('User', userSchema)