import test from 'tape'
import { asyncTest } from 'quiver-util/tape'

import { error } from 'quiver-util/error'
import { Args } from 'quiver-component-basic/util'
import { Config, loadHandler } from 'quiver-component-base/util'
import { simpleHandlerBuilder } from 'quiver-component-basic/constructor'

import { inputHandler } from '../lib/method'
import { recursiveHandler } from '../lib/constructor'

test('recursive component test', assert => {
  assert::asyncTest('basic recursion', async assert => {
    // An overly complicated fibonacci handler
    const fibonacciHandler = simpleHandlerBuilder(
      config => {
        const doFibonacci = config.get('fibonacciHandler')

        return async (args, form) => {
          const { num } = form

          if(typeof(num) !== 'number' || num < 0 || (num|0) !== num) {
            throw error(400, 'form.num must be positive integer')
          }

          if(num === 0) return { result: 0 }
          if(num === 1) return { result: 1 }

          const prev1 = await doFibonacci(args, { num: num-1 })
          const prev2 = await doFibonacci(args, { num: num-2 })

          const result = prev1.result + prev2.result

          return { result }
        }

      }, {
        inputType: 'json',
        outputType: 'json'
      })

    // recursive input handler cannot be chained
    // as we need to reference the returned variable
    fibonacciHandler::inputHandler('fibonacciHandler',
      recursiveHandler(fibonacciHandler))

    const handler = await loadHandler(Config(), fibonacciHandler)

    const args = Args()
    const getFib = async (handler, num) => {
      const { result } = await handler(args, { num })
      return result
    }

    assert.equals(await getFib(handler, 0), 0)
    assert.equals(await getFib(handler, 1), 1)
    assert.equals(await getFib(handler, 3), 2)
    assert.equals(await getFib(handler, 6), 8)

    const clonedHandler = fibonacciHandler.export()()
    const handler2 = await loadHandler(Config(), clonedHandler)

    assert.equals(await getFib(handler2, 5), 5,
      'exported component should remain recursive')

    assert.end()
  })

  assert::asyncTest('mutual recursion', async assert => {
    const evenHandler = simpleHandlerBuilder(
      config => {
        const oddHandler = config.get('oddHandler')

        return async (args, form) => {
          const { num } = form

          if(typeof(num) !== 'number' || num < 0 || (num|0) !== num) {
            throw error(400, 'form.num must be positive integer')
          }

          if(num === 0)
            return { is_even: true }

          const { is_odd } = await oddHandler(args, { num: num-1 })

          return { is_even: is_odd }
        }
      }, {
        inputType: 'json',
        outputType: 'json'
      })

    const oddHandler = simpleHandlerBuilder(
      config => {
        const evenHandler = config.get('evenHandler')

        return async (args, form) => {
          const { num } = form

          if(typeof(num) !== 'number' || num < 0 || (num|0) !== num) {
            throw error(400, 'form.num must be positive integer')
          }

          if(num === 0)
            return { is_odd: false }

          const { is_even } = await evenHandler(args, { num: num-1 })

          return { is_odd: is_even }
        }
      }, {
        inputType: 'json',
        outputType: 'json'
      })

    evenHandler::inputHandler('oddHandler', recursiveHandler(oddHandler))
    oddHandler::inputHandler('evenHandler', recursiveHandler(evenHandler))

    const args = Args()
    const config = Config()

    const evenHandlerFn = await loadHandler(config, evenHandler)
    const oddHandlerFn = await loadHandler(config, oddHandler)

    const isEven = async num => {
      const { is_even } = await evenHandlerFn(args, { num })
      return is_even
    }

    const isOdd = async num => {
      const { is_odd } = await oddHandlerFn(args, { num })
      return is_odd
    }

    assert.equals(await isEven(0), true)
    assert.equals(await isOdd(0), false)

    assert.equals(await isEven(1), false)
    assert.equals(await isOdd(1), true)

    assert.equals(await isEven(2), true)
    assert.equals(await isOdd(2), false)

    assert.equals(await isEven(3), false)
    assert.equals(await isOdd(3), true)

    assert.end()
  })
})
