import { handleableLoader } from 'quiver-component-base/util'

import { inputHandler } from './input-handler'

import {
  simpleHandlerBuilder, streamHandlerBuilder, httpHandlerBuilder
} from 'quiver-component-basic/constructor'

const $extractHandleable = Symbol('@extractHandleable')

const createExtractor = (componentConstructor) =>
  function(field, options) {
    return componentConstructor(
      config => {
        const handleable = config.get($extractHandleable)
        const handler = handleable.get(field)

        if(!handler)
          throw new Error(`cannot extract handler from handleable[${field}].`)

        return handler

      }, options)
      ::inputHandler($extractHandleable, this, {
        loader: handleableLoader
      })
  }

export const extractSimpleHandler = createExtractor(simpleHandlerBuilder)
export const extractStreamHandler = createExtractor(streamHandlerBuilder)
export const extractHttpHandler = createExtractor(httpHandlerBuilder)
