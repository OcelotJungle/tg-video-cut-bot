import { UserError } from "../../bot/errors/user";

export class MaxDurationError extends UserError {
    constructor(maxDuration: number) {
        super(`This bot is supposed to make cuts with max duration of ${maxDuration} seconds.`);
    }
}
