import { ImmutableMap, isImmutableMap } from 'quiver-util/immutable'
import { ConfigMiddleware } from 'quiver-component-basic'

const $aliasConfig = Symbol('@aliasConfig')

export class ConfigAliasMiddleware extends ConfigMiddleware {
  constructor(options={}) {
    const { aliasConfig } = options
    if(!isImmutableMap(aliasConfig))
      throw new TypeError('options.aliasConfig must be ImmutableMap')

    super(options)
    this[$aliasConfig] = aliasConfig
  }

  configHandlerFn() {
    const aliasConfig = this[$aliasConfig]

    return async function(config) {
      for(let [key, aliasKey] of aliasConfig.entries()) {
        config = config.set(key, config.get(aliasKey))
      }
      return config
    }
  }

  get componentType() {
    return 'ConfigAliasMiddleware'
  }
}

export const configAliasMiddleware = (aliasConfig, options={}) => {
  options.aliasConfig = ImmmutableMap(aliasConfig)
  return new ConfigAliasMiddleware(options).activate()
}

export const aliasConfig = function(config) {
  return this.addMiddleware(configOverrideMiddleware(config))
}
