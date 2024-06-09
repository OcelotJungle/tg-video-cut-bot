// Not used since tsx doesn't support emitting metadata, but tsyringe requires it
import "reflect-metadata";

import ffmpegPath from "ffmpeg-static";
import { container } from "tsyringe";
import { Logger } from "./logger";
import { VideoCutBot } from "./bot";
import { Prisma } from "./prisma";
import { Config } from "./config";

global.debug = process.argv.includes("--debug");
global.saveFullVideos = process.argv.includes("--save-full-videos");
global.logger = new Logger();

const config = container.resolve(Config);

container.register("ffmpeg-path", { useValue: ffmpegPath });
container.register("bot-token", { useValue: config.botToken });
// container.register(Prisma, { useValue: new Prisma() });

const prisma = container.resolve(Prisma);
const bot = container.resolve(VideoCutBot);

await bot.setup().start();

async function gracefulShutdown() {
    await prisma.$disconnect();
    await bot.stop();
    process.exit(0);
}

process.once("SIGTERM", gracefulShutdown);
process.once("SIGINT", gracefulShutdown);
