export class NoAppropriateFormatError extends Error {
    constructor(targetQuality: number, url: string) {
        super(`Not found appropriate format (target ${targetQuality}) for ${url}`);
    }
}
