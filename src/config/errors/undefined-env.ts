export class UndefinedEnvError extends Error {
    constructor(name: string) {
        super(`Not defined env ${name}`);
    }
}
