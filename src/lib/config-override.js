import { ImmutableMap, isImmutableMap } from 'quiver-util/immutable'
import { ConfigMiddleware } from 'quiver-component-basic'

const $overrideConfig = Symbol('@overrideConfig')

export class ConfigOverrideMiddleware extends ConfigMiddleware {
  constructor(options={}) {
    const { overrideConfig } = options
    if(!isImmutableMap(overrideConfig))
      throw new TypeError('options.overrideConfig must be ImmutableMap')

    super(options)
    this[$overrideConfig] = overrideConfig
  }

  configHandlerFn() {
    const overrideConfig = this[$overrideConfig]

    return async function(config) {
      for(let [key, value] of overrideConfig.entries()) {
        config = config.set(key, value)
      }
      return config
    }
  }

  get componentType() {
    return 'ConfigOverrideMiddleware'
  }
}

export const configOverrideMiddleware = (overrideConfig, options={}) => {
  options.overrideConfig = ImmutableMap(overrideConfig)
  return new ConfigOverrideMiddleware(options)
}

export const overrideConfig = function(config) {
  return this.addMiddleware(configOverrideMiddleware(config))
}
