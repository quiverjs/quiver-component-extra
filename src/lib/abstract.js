import { fieldAccessor } from 'quiver-util/function'
import { HandleableBuilder, HandleableMiddleware } from 'quiver-component-base'

const $implGetter = Symbol('@implKey')
const $concreteComponent = Symbol('@concreteComponent')
const $defaultComponent = Symbol('@defaultComponent')

const abstractComponentClass = Parent =>
  class AbstractComponent extends Parent {
    constructor(options={}) {
      const {
        implKey, defaultComponent,
        initComponents = ImmmutableMap()
      } = options

      if(!implKey)
        throw new Error('implKey required for constructing abstract component')

      this[$implGetter] = fieldAccessor(implKey)

      if(defaultComponent) {
        this.validateImpl(defaultComponent)
        options.initComponents = initComponents.set($defaultComponent, defaultComponent)
      }

      super(options)
    }

    implement(implMap) {
      if(this.getSubComponent($concreteComponent)) return

      const concreteComponent = this[$implGetter](implMap)
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
    return this.concreteComponent.toHandleableBuilder()
  }

  validateImpl(component) {
    assertIsHandlerComponent(component)
  }

  get componentType() {
    return 'AbstractHandler'
  }
}

export class AbstractMiddleware extends abstractComponentClass(HandleableMiddleware) {
  mainHandleableMiddlewareFn() {
    return this.concreteComponent.toHandleableMiddleware()
  }

  validateImpl(component) {
    assertIsMiddlewareComponent(component)
  }

  get componentType() {
    return 'AbstractMiddleware'
  }
}