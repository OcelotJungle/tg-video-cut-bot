import { configDotenv } from "dotenv";
import { UndefinedEnvError } from "./errors/undefined-env";
import { injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class Config {
    readonly debug: boolean;
    readonly saveFullVideos: boolean;

    readonly botToken: string;

    readonly youtubeTargetQuality: number;

    readonly maxDuration: number;

    constructor() {
        configDotenv();

        this.debug = global.debug;
        this.saveFullVideos = global.saveFullVideos;

        this.botToken = this.getEnv("BOT_TOKEN");

        this.youtubeTargetQuality = +this.getEnv("YOUTUBE_TARGET_QUALITY", "360");

        this.maxDuration = +this.getEnv("MAX_DURATION", "60");
    }

    protected throw(name: string): never {
        throw new UndefinedEnvError(name);
    }

    protected getEnv(name: string, defaultValue?: string) {
        return process.env[name] ?? defaultValue ?? this.throw(name);
    }
}
