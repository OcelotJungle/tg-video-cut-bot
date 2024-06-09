import type { VideoSourceAdapter } from "./adapter";

import { inject, injectable, singleton } from "tsyringe";
import { YoutubeVideoSourceAdapter } from "./youtube/adapter";
import { UnsupportedAdapterError } from "./errors/unsupported-adapter";
import { Config } from "../config";

@singleton()
@injectable()
export class VideoSourceAdapterFactory {
    protected readonly adapters: readonly VideoSourceAdapter[];
    protected readonly adapterMap: Map<string, VideoSourceAdapter>;

    constructor(
        @inject(Config) protected readonly config: Config,
    ) {
        this.adapters = [
            new YoutubeVideoSourceAdapter(this.config.youtubeTargetQuality),
        ];

        this.adapterMap = new Map(
            this.adapters
                .map(adapter => adapter.refs.map(ref => [ref, adapter] as const))
                .flat(),
        );
    }

    create(url: string): VideoSourceAdapter {
        const hostname = new URL(url).hostname.replace(/^www\./, "");

        if (this.adapterMap.has(hostname)) {
            return this.adapterMap.get(hostname)!;
        }

        throw new UnsupportedAdapterError(url);
    }
}
