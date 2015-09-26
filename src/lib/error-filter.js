import { assertFunction } from 'quiver-util/assert'
import { StreamFilter } from 'quiver-component-basic'
import { componentConstructor } from 'quiver-component-base/util'

const errorToStreamFilter = errorHandler =>
  (config, handler) =>
    (args, streamable) =>
      handler(args, streamable)
      .catch(errorHandler)

export class ErrorFilter extends StreamFilter {
  streamFilterFn() {
    const errorHandler = this.errorHandlerFn()
    return errorToStreamFilter(errorHandler)
  }

  errorHandlerFn() {
    throw new Error('abstract method errorHandlerFn() is not implemented')
  }
}

const safeErrorHandlerFn = errorHandler => {
  assertFunction(errorHandler)

  return async function(err) {
    const resultStreamable = await errorHandler(err)
    assertFunction(resultStreamable.toStream,
      'recovered result must be streamable')

    return resultStreamable
  }
}

export const errorFilter = componentConstructor(
  ErrorFilter, 'errorHandlerFn', safeErrorHandlerFn)

export const handleError = function(errorHandler) {
  return this.addMiddleware(errorFilter(errorHandler))
}
