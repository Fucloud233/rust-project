export const NOT_KNOW_ERROR = "Not know error!";

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

export class DepNotFoundError extends NotFoundError {
    crateName: string;
    depName: string;

    constructor(crateName: string, depName: string) {
        super(`The "${depName} in "${crateName}"`);
        this.crateName = crateName;
        this.depName = depName;
    }
}

export class CrateNotFoundError extends NotFoundError {
    constructor(crateName: string) {
        super(`The crate "${crateName}"`);
    }
}

export class ImportCyclesError extends BaseError {
    constructor(crates: string[]) {
        super("Import Cycles: " + crates.join("->"));
    }
}