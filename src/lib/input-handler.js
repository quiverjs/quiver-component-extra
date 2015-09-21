import { entries } from 'quiver-util/object'
import { ImmutableMap } from 'quiver-util/immutable'
import { ConfigMiddleware } from 'quiver-component-basic'
import { assertIsActivated } from 'quiver-component-base/util'

const $toConfig = Symbol('@toConfig')
const $handlerLoader = Symbol('@loader')
const $inputHandler = Symbol('@inputHandler')

export class InputHandlerMiddleware extends ConfigMiddleware {
  constructor(options={}) {
    const {
      toConfig, inputHandler, loader,
      initComponents = ImmutableMap()
    } = options

    if(typeof(toConfig) !== 'string' && typeof(toConfig) !== 'symbol')
      throw new TypeError('invalid options.toConfig')

    assertIsActivated(inputHandler)

    if(!inputHandler.isHandlerComponent)
      throw new TypeError('options.inputHandler must be handler component')

    options.initComponents = initComponents.set($inputHandler, inputHandler)

    super(options)

    this[$toConfig] = toConfig
    this[$handlerLoader] = loader
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

export const inputHandlerMiddleware = (toConfig, handlerComponent, options={}) => {
  options.toConfig = toConfig
  options.inputHandler = handlerComponent
  return new InputHandlerMiddleware(options).activate()
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
