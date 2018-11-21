import { path } from 'app-root-path'
import { createLogger, format, transports } from 'winston'
import { LOGS_FOLDER } from './env.config'

const myFormat = format.combine(
    format.colorize(),
    format.printf(info => {
        let log = `${info.timestamp}: ${info.level}: ${info.message} `
        const keys = Object.keys(info).filter(key => key !== 'timestamp' && key !== 'level' && key !== 'message')
        if (keys.length) {
            const obj: any = {}
            keys.forEach(key => (obj[key] = info[key]))
            log += JSON.stringify(obj)
        }
        return log
    })
)

const options = {
    error: {
        name: 'error-file',
        level: 'error',
        filename: `${path}/${LOGS_FOLDER}error.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5,
        format: myFormat
    },
    info: {
        name: 'info-file',
        level: 'info',
        filename: `${path}/${LOGS_FOLDER}info.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5,
        format: myFormat
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: myFormat
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
