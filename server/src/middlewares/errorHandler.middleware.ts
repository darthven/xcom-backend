import { Context } from 'koa'
import { RequestError, StatusCodeError } from 'request-promise-native/errors'
import { Action, ActionMetadata, HttpError, KoaMiddlewareInterface, Middleware } from 'routing-controllers'
import { NODE_ENV } from '../config/env.config'
import logger from '../config/logger.config'

@Middleware({ type: 'before' })
export class ErrorHandlerMiddleware implements KoaMiddlewareInterface {
    private developmentMode = NODE_ENV === 'development'

    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        try {
            return await next()
        } catch (e) {
            context.body = this.processJsonError(e)
            // set http status
            context.status = e.statusCode || e.httpCode || 500
            logger.error(e.stack)
        }
    }

    private processJsonError(error: any) {
        if (typeof error.toJSON === 'function') {
            return error.toJSON()
        }

        const processedError: any = {}
        if (error instanceof Error) {
            const name = error.name && error.name !== 'Error' ? error.name : error.constructor.name
            processedError.name = name

            if (error.message) {
                processedError.message = error.message
            }
            if (error.stack && this.developmentMode) {
                processedError.stack = error.stack
            }

            if (!this.developmentMode && this.isRequestError(error)) {
                // do not leak outgoing request details
                return processedError
            }

            Object.keys(error)
                .filter(
                    key =>
                        key !== 'stack' &&
                        key !== 'name' &&
                        key !== 'message' &&
                        (!(error instanceof HttpError) || key !== 'httpCode')
                )
                .forEach(key => (processedError[key] = (error as any)[key]))

            return Object.keys(processedError).length > 0 ? processedError : undefined
        }

        return error
    }

    private isRequestError(error: any): boolean {
        return error instanceof StatusCodeError || error instanceof RequestError
    }
}
