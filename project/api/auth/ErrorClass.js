class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

class TokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "TokenError";
    }
}

module.exports = {
    AuthError, TokenError
}