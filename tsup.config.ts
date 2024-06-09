import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/app.ts"],
    format: "esm",
    outDir: "out",
    splitting: true,
    clean: true,
    outExtension: () => ({ js: ".mjs" }),
});
