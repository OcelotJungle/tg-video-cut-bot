import { Console } from "console";

export enum LogLevel {
    Off = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4,
}

function getLogLevel() {
    if (global.debug) return LogLevel.Debug;

    const logLevelArg = process.argv.find(a => a.startsWith("--log-level") || a.startsWith("-l")) ?? "-l=off";
    const logLevelString = logLevelArg.split("=", 2)[1]!;

    switch (logLevelString) {
        case "error": return LogLevel.Error;
        case "warn": return LogLevel.Warn;
        case "info": return LogLevel.Info;
        case "debug": return LogLevel.Debug;
        default: return LogLevel.Off;
    }
}

export class Logger extends Console {
    constructor(protected readonly logLevel = getLogLevel()) {
        super(process.stdout, process.stderr, false);
    }

    protected static requireLogLevel(logLevel: LogLevel): MethodDecorator {
        return (_1: unknown, _2: unknown, descriptor: PropertyDescriptor) => {
            const fn = descriptor.value as (...args: unknown[]) => void;
            descriptor.value = function (this: Logger, ...args: unknown[]) {
                if (this.logLevel >= logLevel) return fn.apply(this, args);
            };
        };
    }

    protected static timed(formatter = (date: Date) => date.toISOString()): MethodDecorator {
        return (_1: unknown, _2: unknown, descriptor: PropertyDescriptor) => {
            const fn = descriptor.value as (...args: unknown[]) => void;
            descriptor.value = function (this: Logger, ...args: unknown[]) {
                return fn.call(this, `[${formatter(new Date())}]`, ...args);
            };
        };
    }

    @Logger.requireLogLevel(LogLevel.Error)
    @Logger.timed()
    override error(...args: unknown[]) {
        super.error(...args);
    }

    @Logger.requireLogLevel(LogLevel.Warn)
    @Logger.timed()
    override warn(...args: unknown[]) {
        super.warn(...args);
    }

    @Logger.requireLogLevel(LogLevel.Info)
    @Logger.timed()
    override info(...args: unknown[]) {
        super.info(...args);
    }

    @Logger.requireLogLevel(LogLevel.Off)
    @Logger.timed()
    override log(...args: unknown[]) {
        super.log(...args);
    }

    @Logger.requireLogLevel(LogLevel.Debug)
    @Logger.timed()
    override debug(...args: unknown[]) {
        super.debug(...args);
    }
}
