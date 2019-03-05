const mongoose = require('mongoose')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true
    },
    hash: {
        required: true,
        type: String
    },
    role: {
        required: true,
        type: String,
        enum: ['volunteer', 'administrator']
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

userSchema.plugin(mongooseUniqueValidator)

mongoose.model('User', userSchema)