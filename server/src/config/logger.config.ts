import { path } from 'app-root-path'
import { createLogger, format, transports } from 'winston'

const options = {
    error: {
        name: 'error-file',
        level: 'error',
        filename: `${path}/logs/error.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5
    },
    info: {
        name: 'info-file',
        level: 'info',
        filename: `${path}/logs/info.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: format.combine(format.colorize(), format.simple())
    }
}

// IF DRYRUN ENABLED LOG CONFIGURATION IS EMPTY
const logger = createLogger({
    transports: [
        new transports.File(options.error),
        new transports.File(options.info),
        new transports.Console(options.console)
    ],
    exitOnError: false
})

export default logger
