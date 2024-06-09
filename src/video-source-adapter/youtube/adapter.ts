import type { Readable } from "stream";
import type { VideoInfo, VideoSourceAdapter } from "../adapter";

import ytdl from "ytdl-core";
import { NoAppropriateFormatError } from "./errors/no-appropriate-format";

export class YoutubeVideoSourceAdapter implements VideoSourceAdapter {
    readonly refs: string[] = [
        "youtube.com",
        "youtu.be",
    ];

    constructor(protected readonly targetQuality: number) { }

    async getInfo(url: string): Promise<VideoInfo> {
        const info = await ytdl.getBasicInfo(url);

        return {
            duration: +info.videoDetails.lengthSeconds,
        };
    }

    protected getFormat(formats: ytdl.videoFormat[]) {
        return formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => {
                const quality = +format.qualityLabel.slice(0, format.qualityLabel.indexOf("p"));
                return { format, quality };
            })
            .filter(({ quality }) => quality <= this.targetQuality)
            .sort((a, b) => b.quality - a.quality)[0]?.format;
    }

    async getStream(url: string): Promise<Readable> {
        const info = await ytdl.getInfo(url);
        const format = this.getFormat(info.formats);

        if (!format) throw new NoAppropriateFormatError(this.targetQuality, url);

        logger.debug(format.width, format.height, format.bitrate, +(format.approxDurationMs ?? -1));

        return ytdl.downloadFromInfo(info, { format, highWaterMark: 2_560_000 });
    }
}
