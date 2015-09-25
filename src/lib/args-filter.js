import { assertFunction } from 'quiver-util/assert'
import { assertArgs } from 'quiver-component-basic/util'

import { StreamFilter } from 'quiver-component-basic'
import { componentConstructor } from 'quiver-component-base/util'

const argsBuilderToStreamFilter = argsBuilder =>
  async function(config, handler) {
    const argsHandler = await argsBuilder(config)

    return async function(args, streamable) {
      const filteredArgs = await argsHandler(args) || args

      return handler(filteredArgs, streamable)
    }
  }

export class ArgsBuilderFilter extends StreamFilter {
  streamFilterFn() {
    const argsBuilder = this.argsBuilderFn()
    return argsBuilderToStreamFilter(argsBuilder)
  }

  argsBuilderFn() {
    throw new Error('abstract method argsBuilderFn() is not implemented')
  }
}

export class ArgsFilter extends ArgsBuilderFilter {
  argsBuilderFn() {
    const argsHandler = this.argsHandlerFn()
    return config => Promise.resolve(argsHandler)
  }

  argsHandlerFn() {
    throw new Error('abstract method argsHandlerFn() is not implemented')
  }
}

const safeArgsHandlerFn = argsHandler => {
  assertFunction(argsHandler)

  return async function(args) {
    const filteredArgs = await argsHandler(args) || args
    assertArgs(filteredArgs)

    return filteredArgs
  }
}

const safeArgsBuilderFn = argsBuilder => {
  assertFunction(argsBuilder)

  return async function(config) {
    const argsHandler = await argsBuilder(config)
    return safeArgsHandlerFn(argsHandler)
  }
}

export const argsFilter = componentConstructor(
  ArgsFilter, 'argsHandlerFn', safeArgsHandlerFn)

export const argsBuilderFilter = componentConstructor(
  ArgsBuilderFilter, 'argsBuilderFn', safeArgsBuilderFn)

export const filterArgs = function(argsHandler) {
  return this.addMiddleware(argsFilter(argsHandler))
}
