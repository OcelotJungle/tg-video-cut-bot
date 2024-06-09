export class Period {
    constructor(
        readonly start: number,
        readonly end: number,
        readonly duration = end - start,
    ) { }

    protected static parseTime(time: string) {
        const [_seconds, _minutes, _hours] = time
            .replace(/[^\d:.]/g, "")
            .split(":")
            .reverse();

        let hours = 0, minutes = 0, seconds = 0;

        if (_hours) hours = parseFloat(_hours);
        if (_minutes) minutes = parseFloat(_minutes);
        if (_seconds) seconds = parseFloat(_seconds);

        return (hours * 60 + minutes) * 60 + seconds;
    }

    static from(string: string | undefined) {
        const [_start, _end] = string?.split("-") ?? [];

        const start = _start ? this.parseTime(_start) : 0;
        const end = _end ? this.parseTime(_end) : Number.POSITIVE_INFINITY;

        return new Period(start, end);
    }
}
