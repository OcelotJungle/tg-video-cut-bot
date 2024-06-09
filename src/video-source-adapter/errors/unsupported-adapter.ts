export class UnsupportedAdapterError extends Error {
    constructor(url: string) {
        super(`Unsupported source: ${url}`);
    }
}
