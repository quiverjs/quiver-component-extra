import { HandleableBuilder } from 'quiver-component-base'
import {
  assertHandlerComponent, Handleable,
  bindLoader, getHandlerMap
} from 'quiver-component-base/util'

import { streamHandlerLoader } from 'quiver-component-basic/util'

const $inHandler = Symbol('@inHandler')
const $compiledFn = Symbol('@compiledFn')

export class RecursiveHandler extends HandleableBuilder {
  constructor(options={}) {
    const { inHandler } = options
    assertHandlerComponent(inHandler)

    super(options)

    this[$compiledFn] = null

    this.setSubComponent($inHandler, inHandler)
    this.setLoader(inHandler.handlerLoader)
  }

  // override parent's final builder function
  // to memoize returned compiled function to
  // prevent infinite loop.
  handleableBuilderFn() {
    const compiledFn = this[$compiledFn]
    if(compiledFn) return compiledFn

    let inBuilder

    const builder = async config => {
      if(!inBuilder)
        throw new Error('inner builder is not compiled yet')

      return inBuilder(config)
    }

    this[$compiledFn] = builder
    inBuilder = super.handleableBuilderFn()
    this[$compiledFn] = null

    return builder
  }

  mainHandleableBuilderFn() {
    const { id } = this
    const handler = this.getSubComponent($inHandler)
    const loadHandler = bindLoader(handler, streamHandlerLoader)

    return async config => {
      let inHandler

      const fixedHandler = async (args, streamable) => {
        if(!inHandler)
          throw new Error('inner handler is not yet initialized')

        return inHandler(args, streamable)
      }

      const handleable = Handleable({
        streamHandler: fixedHandler
      })

      // set the result handler map first
      // before loading inner handler to prevent
      // infinite recursion.
      const handlerMap = getHandlerMap(config)
      handlerMap.set(id, handleable)

      inHandler = await loadHandler(config)

      return handleable
    }
  }

  get isStreamHandlerComponent() {
    return true
  }
}

export const recursiveHandler = inHandler =>
  new RecursiveHandler({ inHandler })
