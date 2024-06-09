import { UserError } from "./user";

export class InvalidUrlError extends UserError {
    constructor() {
        super("You have to write valid url.");
    }
}
