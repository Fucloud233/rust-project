export class ExistError extends Error {
    message: string;

    constructor(fileName: string) {
        super();
        this.message = fileName + ' already exists.';
    }
}