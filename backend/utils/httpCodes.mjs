import { setUncaughtExceptionCaptureCallback } from "node:process"

// fixe
const HTTP_CODES = {
    SUCCESS: {
        OK: 200,
        CREATED: 201
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500
    }
};

export default HTTP_CODES;