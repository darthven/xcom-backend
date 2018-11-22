import 'reflect-metadata'
import logger from '../config/logger.config'
import pipes from './pipes'

const runScript = async (name: string) => {
    const script = (await import(`./${name}`)).default
    return script()
}

const pipeToPlan = (pipe: Array<string | string[]>): Array<() => Promise<any>> => {
    return pipe.map((it: any) => {
        if (isPipe(it)) {
            // chain sequentially
            return pipeToPlan(pipes[it]).reduce((prev, cur) => () => prev().then(() => cur()))
        }
        if (Array.isArray(it)) {
            // unwrap and run in parallel
            return () => Promise.all(pipeToPlan(it).map((fun: () => Promise<any>) => fun()))
        }
        if (typeof it === 'string') {
            return () => {
                const t = process.hrtime()
                logger.info(`started script: ${it}`)
                return runScript(it).then(
                    result => {
                        logger.info(`finished script: ${it} in ${process.hrtime(t)[0]} seconds`, result)
                        return result
                    },
                    err => {
                        logger.error(`failed script: ${it} in ${process.hrtime(t)[0]} seconds`, err)
                        logger.error(err.stack)
                        return Promise.reject(err)
                    }
                )
            }
        }
        return () => Promise.reject(new Error(`unknown pipe el ${it}`))
    })
}

const isPipe = (name: string): boolean => {
    return Object.keys(pipes).includes(name)
}

export const run = async (pipe: Array<string | string[]>) => {
    const plan = pipeToPlan(pipe)
    for (const step of plan) {
        await step()
    }
}
