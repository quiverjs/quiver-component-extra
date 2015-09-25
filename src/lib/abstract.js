import { ImmutableMap } from 'quiver-util/immutable'

import {
  HandleableBuilder, HandleableMiddleware
} from 'quiver-component-base'

import {
  allSubComponents,
  assertHandlerComponent, assertMiddlewareComponent
} from 'quiver-component-base/util'

const $implKey = Symbol('@implKey')
const $concreteComponent = Symbol('@concreteComponent')
const $defaultComponent = Symbol('@defaultComponent')

const abstractComponentClass = Parent =>
  class AbstractComponent extends Parent {
    constructor(options={}) {
      const { implKey, defaultComponent } = options

      if(!implKey)
        throw new Error('implKey required for constructing abstract component')

      super(options)

      this.rawComponent[$implKey] = implKey

      if(defaultComponent) {
        this.validateImpl(defaultComponent)
        this.setSubComponent($defaultComponent, defaultComponent)
      }
    }

    implement(implMap) {
      if(this.getSubComponent($concreteComponent)) return

      const implKey = this[$implKey]

      const concreteComponent = implMap.get(implKey)

      if(concreteComponent) {
        this.validateImpl(concreteComponent)
        this.setSubComponent($concreteComponent, concreteComponent)
      }

      return this
    }

    get concreteComponent() {
      const concreteComponent = this.getSubComponent($concreteComponent) ||
        this.getSubComponent($defaultComponent)

      if(!concreteComponent)
        throw new Error('Abstract component do not have concrete implementation')

      return concreteComponent
    }

    validateImpl(component) {
      // noop
    }
  }

export class AbstractHandler extends abstractComponentClass(HandleableBuilder) {
  mainHandleableBuilderFn() {
    return this.concreteComponent.handleableBuilderFn()
  }

  validateImpl(component) {
    assertHandlerComponent(component)
  }

  get componentType() {
    return 'AbstractHandler'
  }
}

export class AbstractMiddleware extends abstractComponentClass(HandleableMiddleware) {
  mainHandleableMiddlewareFn() {
    return this.concreteComponent.handleableMiddlewareFn()
  }

  validateImpl(component) {
    assertMiddlewareComponent(component)
  }

  get componentType() {
    return 'AbstractMiddleware'
  }
}

export const abstractHandler = function(implKey, options={}) {
  options.implKey = implKey
  return new AbstractHandler(options)
}

export const abstractMiddleware = function(implKey, options={}) {
  options.implKey = implKey
  return new AbstractMiddleware(options)
}

export const implement = function(rawImplMap) {
  const implMap = ImmutableMap(rawImplMap)
  for(let subComponent of allSubComponents(this)) {
    if(subComponent.implement)
      subComponent.implement(implMap)
  }
}
