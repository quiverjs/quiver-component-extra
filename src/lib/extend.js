import { ImmmutableMap } from 'quiver-util/immutable'
import { HandleableBuilder, HandleableMiddleware } from 'quiver-component-base'

const $extendHandler = Symbol('@extendHandler')

export class ExtendHandler extends HandleableBuilder {
  constructor(options={}) {
    const {
      extendHandler,
      initComponents = ImmmutableMap()
    } = options

    if(!extendHandler || !extendHandler.isHandlerComponent)
      throw new TypeError('options.extendHandler must be handler component')

    options.initComponents = initComponents.set($extendHandler, extendHandler)

    super(options)
  }

  mainHandleableBuilderFn() {
    const extendHandler = this.getSubComponent($extendHandler)
    return extendHandler.handleableBuilderFn()
  }
}

export class ExtendMiddleware extends HandleableMiddleware {
  constructor(options={}) {
    const {
      extendMiddleware,
      initComponents = ImmmutableMap()
    } = options

    if(!extendMiddleware || !extendMiddleware.isMiddlewareComponent)
      throw new TypeError('options.extendMiddleware must be middleware component')

    options.initComponents = initComponents.set($extendMiddleware, extendMiddleware)

    super(options)
  }

  mainHandleableMiddlewareFn() {
    const extendMiddleware = this.getSubComponent($extendMiddleware)
    return extendHandler.handleableBuilderFn()
  }
}

export const extendHandler = (handlerComponent, options={}) => {
  options.extendHandler = handlerComponent
  return new ExtendHandler(options).activate()
}

export const extendMiddleware = (middlewareComponent, options={}) => {
  options.extendMiddleware = middlewareComponent
  return new ExtendMiddleware(options).activate()
}
