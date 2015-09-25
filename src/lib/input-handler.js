import { entries } from 'quiver-util/object'
import { ConfigMiddleware } from 'quiver-component-basic'
import { assertHandlerComponent } from 'quiver-component-base/util'

const $toConfig = Symbol('@toConfig')
const $handlerLoader = Symbol('@loader')
const $inputHandler = Symbol('@inputHandler')

export class InputHandlerMiddleware extends ConfigMiddleware {
  constructor(options={}) {
    const {
      toConfig, inputHandler, loader
    } = options

    if(typeof(toConfig) !== 'string' && typeof(toConfig) !== 'symbol')
      throw new TypeError('invalid options.toConfig')

    assertHandlerComponent(inputHandler,
      'options.inputHandler must be handler component')

    super(options)

    this.rawComponent[$toConfig] = toConfig
    this.rawComponent[$handlerLoader] = loader

    this.setSubComponent($inputHandler, inputHandler)
  }

  configHandlerFn() {
    const handlerComponent = this.inputHandlerComponent

    const componentId = handlerComponent.id
    const builder = handlerComponent.handleableBuilderFn()

    const loader = this[$handlerLoader] || handlerComponent.handlerLoader
    const toConfig = this[$toConfig]

    return async function(config) {
      const handler = await loader(config, componentId, builder)
      return config.set(toConfig, handler)
    }
  }

  get inputHandlerComponent() {
    return this.getSubComponent($inputHandler)
  }

  get componentType() {
    return 'InputHandlerMiddleware'
  }
}

export const inputHandlerMiddleware = function(toConfig, handlerComponent, options={}) {
  options.toConfig = toConfig
  options.inputHandler = handlerComponent
  return new InputHandlerMiddleware(options)
}

export const inputHandler = function(toConfig, handlerComponent, options) {
  return this.addMiddleware(inputHandlerMiddleware(
    toConfig, handlerComponent, options))
}

export const inputHandlers = function(handlerMap) {
  for(let [toConfig, component] of entries(handlerMap)) {
    this::inputHandler(toConfig, component)
  }
  return this
}
