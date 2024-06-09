import { UserError } from "./user";

export class MessageFormatError extends UserError {
    constructor() {
        super("You have to write url in first line.");
    }
}
