const LogLevel = Object.freeze({
    SUCCESS: "success",
    INFO: "info",
    ERROR: "error",
    START: "start",
    WARNING: "warning",
    END: "end"
});

const colors = {
    [LogLevel.SUCCESS]: { color: "\x1b[32m", bg: "\x1b[42m" }, // Green text, LimeGreen background
    [LogLevel.INFO]: { color: "\x1b[36m", bg: "\x1b[46m" }, // DodgerBlue text, Turquoise background
    [LogLevel.ERROR]: { color: "\x1b[31m", bg: "\x1b[40m" }, // Red text, Black background
    [LogLevel.START]: { color: "\x1b[38;5;2m", bg: "\x1b[38;5;10m" }, // OliveDrab text, PaleGreen background
    [LogLevel.WARNING]: { color: "\x1b[33m", bg: "\x1b[40m" }, // Yellow text, Black background
    [LogLevel.END]: { color: "\x1b[35m", bg: "\x1b[45m" }, // Orchid text, MediumVioletRed background
};

const reset = "\x1b[0m"; // Reset styles

function log(msg, level, time = true) {
    const selectedColor = colors[level] || { color: "", bg: "" };

    if (typeof msg === "object") 
        console.log(msg);
    else {
        const date = time ? `[${new Date(8.64e15).toString()}] - ${selectedColor.color}${msg}${reset}` : `${selectedColor.color}${msg}${reset}` 
        console.log(date);
    }
}

module.exports = {
    LogLevel,
    log
};
