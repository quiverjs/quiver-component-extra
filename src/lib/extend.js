import {
  HandleableBuilder, HandleableMiddleware
} from 'quiver-component-base'

import {
  bindLoader, handleableLoader,
  assertHandlerComponent, assertMiddlewareComponent
} from 'quiver-component-base/util'

const $extendHandler = Symbol('@extendHandler')
const $extendMiddleware = Symbol('@extendMiddleware')

export class ExtendHandler extends HandleableBuilder {
  constructor(options={}) {
    const { extendHandler } = options

    assertHandlerComponent(extendHandler,
      'options.extendHandler must be handler component')

    super(options)

    this.setSubComponent($extendHandler, extendHandler)
  }

  mainHandleableBuilderFn() {
    const extendHandler = this.getSubComponent($extendHandler)
    return bindLoader(extendHandler, handleableLoader)
  }
}

export class ExtendMiddleware extends HandleableMiddleware {
  constructor(options={}) {
    const { extendMiddleware } = options

    assertMiddlewareComponent(extendMiddleware,
      'options.extendMiddleware must be middleware component')

    super(options)

    this.setSubComponent($extendMiddleware, extendMiddleware)
  }

  mainHandleableMiddlewareFn() {
    const extendMiddleware = this.getSubComponent($extendMiddleware)
    return extendMiddleware.handleableBuilderFn()
  }
}

export const extendHandler = function(handlerComponent, options={}) {
  options.extendHandler = handlerComponent
  return new ExtendHandler(options)
}

export const extendMiddleware = function(middlewareComponent, options={}) {
  options.extendMiddleware = middlewareComponent
  return new ExtendMiddleware(options)
}

export const extend = function() {
  if(this.isHandlerComponent)
    return extendHandler(this)

  if(this.isMiddlewareComponent)
    return extendMiddleware(this)

  throw new Error('unknown component type to extend')
}
