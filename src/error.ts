export class BaseError extends Error {
    message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class ExistError extends BaseError {
    constructor(fileName: string) {
        super(fileName + ' already exists.');
    }
}

export class NotFoundError extends BaseError {
    constructor(fileName: string) {
        super(fileName + ' not found.');
    }
}

export class FileParseError extends BaseError {
    constructor(fileName: string) {
        super(fileName + ' parsing falied. ');
    }
}