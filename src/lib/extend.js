import { ImmutableMap } from 'quiver-util/immutable'
import { HandleableBuilder, HandleableMiddleware } from 'quiver-component-base'

const $extendHandler = Symbol('@extendHandler')
const $extendMiddleware = Symbol('@extendMiddleware')

export class ExtendHandler extends HandleableBuilder {
  constructor(options={}) {
    const {
      extendHandler,
      initComponents = ImmutableMap()
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
      initComponents = ImmutableMap()
    } = options

    if(!extendMiddleware || !extendMiddleware.isMiddlewareComponent)
      throw new TypeError('options.extendMiddleware must be middleware component')

    options.initComponents = initComponents.set($extendMiddleware, extendMiddleware)

    super(options)
  }

  mainHandleableMiddlewareFn() {
    const extendMiddleware = this.getSubComponent($extendMiddleware)
    return extendMiddleware.handleableBuilderFn()
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
