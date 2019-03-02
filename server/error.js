class InternalServerError extends Error {
    constructor(err) {
        super(err)
        this.name = 'InternalServerError'
    }
}

module.exports = InternalServerError