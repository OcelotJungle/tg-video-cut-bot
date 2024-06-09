import { UserError } from "./user";

export class ChatTypeRestrictionError extends UserError {
    constructor() {
        super("This action doesn't allow this type of chat.");
    }
}
