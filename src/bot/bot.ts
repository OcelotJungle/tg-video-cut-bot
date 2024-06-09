import type { DeriveDefinitions, ErrorDefinitions } from "gramio";

import fs from "fs";
import { Bot, MessageContext } from "gramio";
import { inject, injectable, singleton } from "tsyringe";
import {
    LocalFileData,
    constructFileFromLocalFileData as createFile,
} from "get-file-object-from-local-path";
import * as errors from "./errors";
import { Period } from "../period";
import { Prisma } from "../prisma";
import { Downloader } from "../downloader";

export type User = {
    userId: number;
    username: string | null;
    displayName: string;
};

export type MessageDerive = { userInfo: User };

@injectable()
@singleton()
export class VideoCutBot extends Bot<
    ErrorDefinitions,
    DeriveDefinitions & { message: MessageDerive }
> {
    constructor(
        @inject("bot-token") token: string,
        @inject(Prisma) protected readonly prisma: Prisma,
        @inject(Downloader) protected readonly downloader: Downloader,
    ) {
        super(token);
    }

    protected getUserInfo(ctx: MessageContext<this>): User {
        return {
            userId: ctx.from!.id,
            username: ctx.from!.username ?? null,
            displayName: ctx.from!.firstName,
        };
    }

    protected async handleMessage(ctx: MessageContext<this> & MessageDerive) {
        if (ctx.chat.type === "channel") {
            throw new errors.ChatTypeRestrictionError();
        }

        const { text } = ctx;
        if (!text) throw new errors.ContentTypeRescrictionError();

        const [url, periodText] = text.split("\n");
        if (!url) throw new errors.MessageFormatError();
        if (!/^http.+?/i.test(url)) throw new errors.InvalidUrlError();

        const userInfo = ctx.userInfo;
        const user = await this.prisma.user.upsert({
            where: { userId: userInfo.userId },
            create: userInfo,
            update: userInfo,
        });

        const period = Period.from(periodText);

        logger.debug({ url, period });

        const request = await this.prisma.request.create({
            data: {
                url,
                period: periodText ?? "",
                duration: period.duration,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        try {
            const start = Date.now();

            const result = await this.downloader.download(request.id, url, period);
            logger.debug(result);

            const file = createFile(new LocalFileData(result.path));
            await ctx.replyWithVideo(file)
                .then(() => fs.promises.rm(result.path));

            const end = Date.now();

            const spentTime = (end - start) / 1000;
            logger.debug(`Spent time: ${Math.ceil(spentTime)} seconds`);

            await this.prisma.request.update({
                where: { id: request.id },
                data: {
                    duration: result.duration,
                    size: Math.ceil(file.size / 1024),
                    spentTime: spentTime,
                },
            });
        }
        catch (e) {
            await this.prisma.request.update({
                where: { id: request.id },
                data: { error: e instanceof Error ? e.message : String(e) },
            });

            throw e;
        }
    }

    setup() {
        return this
            .onStart(({ info: { username } }) => logger.log(`Bot ${username} was started!`))

            .on("message", (ctx, next) => {
                ctx.userInfo = this.getUserInfo(ctx);
                return next();
            })

            .on("message", async ctx => {
                try {
                    await ctx.react("👀");
                    await this.handleMessage(ctx);
                    await ctx.react("👍");
                }
                catch (e) {
                    if (!(e instanceof errors.UserError)) {
                        logger.error(e);
                    }

                    await ctx.reply(e instanceof Error ? e.message : String(e));
                    await ctx.react("👎");
                }
            });
    }
}
