import type { Period } from "../period";
import type { VideoSourceAdapter } from "../video-source-adapter";

import path from "path";
import fs from "fs";
import { inject, injectable, singleton } from "tsyringe";
import { Ffmpeg } from "../ffmpeg";
import { Config } from "../config";
import { MaxDurationError } from "./errors/max-duration";
import { VideoSourceAdapterFactory } from "../video-source-adapter";

export type DownloadResult = {
    duration: number;
    path: string;
}

function getMp4FileName(root: string, name: string) {
    return path.join(root, `${name}.mp4`);
}

@singleton()
@injectable()
export class Downloader {
    protected readonly root: string;

    constructor(
        @inject(Config) protected readonly config: Config,
        @inject(VideoSourceAdapterFactory) protected readonly videoSourceAdapterFactory: VideoSourceAdapterFactory,
        @inject(Ffmpeg) protected readonly ffmpeg: Ffmpeg,
    ) {
        this.root = path.join(process.cwd(), "tmp");

        if (!global.debug) fs.rmSync(this.root, { force: true, recursive: true });
        fs.mkdirSync(this.root, { recursive: true });
    }

    protected async getActualDuration(
        adapter: VideoSourceAdapter,
        url: string,
        period: Period,
    ) {
        return await adapter
            .getInfo(url)
            .then(info => info.duration)
            .then(Math.min.bind(Math, period.end))
            .then(end => end - period.start);
    }

    async download(id: string, url: string, period: Period): Promise<DownloadResult> {
        const adapter = this.videoSourceAdapterFactory.create(url);

        let stream = await adapter.getStream(url);
        logger.debug("original.hwm", stream.readableHighWaterMark);

        const duration = await this.getActualDuration(adapter, url, period);
        if (duration > this.config.maxDuration) {
            throw new MaxDurationError(this.config.maxDuration);
        }

        if (this.config.saveFullVideos) {
            const path = getMp4FileName(this.root, `${id}_yt`);

            await new Promise((resolve, reject) => {
                stream
                    .pipe(fs.createWriteStream(path))
                    .on("error", reject)
                    .on("finish", resolve);
            });

            stream = fs.createReadStream(path);
        }

        const path = getMp4FileName(this.root, id);

        return await this.ffmpeg
            .save(stream, path, period.start, duration)
            .then(() => ({ duration, path }))
            .catch(e =>
                fs.promises
                    .rm(path, { force: true })
                    .then(() => { throw e })
                    .catch(error => {
                        const message = error instanceof Error ? error.message : String(error);
                        logger.error(`Unable to remove '${path}': ${message}`);

                        throw e;
                    }),
            );
    }
}
