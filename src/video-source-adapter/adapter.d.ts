import type { Readable } from "stream";

export type VideoInfo = {
    duration: number;
}

export interface VideoSourceAdapter {
    refs: readonly string[];
    getInfo(url: string): Promise<VideoInfo>;
    getStream(url: string): Promise<Readable>;
}
