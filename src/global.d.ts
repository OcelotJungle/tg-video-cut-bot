/* eslint-disable no-var */

declare module "get-file-object-from-local-path" {
    class LocalFileData {
        constructor(path: string);
    }

    function constructFileFromLocalFileData(localFileData: LocalFileData): File;
}

declare var debug: boolean;
declare var saveFullVideos: boolean;
declare var logger: Console;
