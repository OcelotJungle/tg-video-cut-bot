import { UserError } from "./user";

export class ContentTypeRescrictionError extends UserError {
    constructor() {
        super("This bot accepts only text.");
    }
}
