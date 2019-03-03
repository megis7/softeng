class BadRequestError extends Error {
    constructor(err) {
        super(err)
        this.name = 'BadRequestError'
        this.status = 400
    }
}

class UnauthorizedError extends Error {
    constructor(err) {
        super(err)
        this.name = 'UnauthorizedError'
        this.status = 401
    }
}

class ForbiddenError extends Error {
    constructor(err) {
        super(err)
        this.name = 'ForbiddenError'
        this.status = 403
    }
}

class NotFoundError extends Error {
    constructor(err) {
        super(err)
        this.name = 'NotFoundError'
        this.status = 404
    }
}

class InternalServerError extends Error {
    constructor(err) {
        super(err)
        this.name = 'InternalServerError'
        this.status = 500
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
}