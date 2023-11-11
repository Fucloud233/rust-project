import { window } from "vscode";

export const NOT_KNOWN_ERROR = "Not known error!";

// implement simple error handle 
export function handleError(error: any) {
    if(error instanceof BaseError) {
        window.showErrorMessage(error.message);
    } else {
        window.showErrorMessage(NOT_KNOWN_ERROR);
        console.log(error);
    }
} 

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
        super(fileName + ' parsing failed. ');
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