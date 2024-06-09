import type { Readable } from "stream";

import { spawn } from "child_process";
import { inject, injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class Ffmpeg {
    constructor(
        @inject("ffmpeg-path") protected readonly path: string,
    ) { }

    save(
        input: Readable,
        output: string,
        start = 0,
        duration = 0,
    ) {
        return new Promise<void | string>((resolve, reject) => {
            const args: string[] = ["-i", "pipe:0", "-y"];

            args.push("-ss", String(start));
            args.push("-t", String(duration));

            args.push(output);

            const ffmpeg = spawn(this.path, args, { stdio: ["pipe", "ignore", "ignore"] });

            ffmpeg.on("close", code => {
                if (code === 0) resolve();
                else reject(`FFmpeg process exited with code ${code}`);
            });

            ffmpeg.stdin.on("error", () => { });

            input.pipe(ffmpeg.stdin, { end: false });
        });
    }
}
