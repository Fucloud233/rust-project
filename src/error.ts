class BaseError extends Error {
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
    constructor(fileNmae: string) {
        super(fileNmae + ' not found.');
    }
}