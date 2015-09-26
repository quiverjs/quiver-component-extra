import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { handleableBuilder } from 'quiver-component-base/constructor'

import {
  textToStreamable, streamableToText, emptyStreamable
} from 'quiver-stream-util'

import {
  loadHandler, createConfig, createHandleable
} from 'quiver-component-base/util'

import { createArgs } from 'quiver-component-basic/util'

import {
  extractSimpleHandler, extractStreamHandler
} from '../lib/method'

test('extract handler test', assert => {
  assert::asyncTest('custom handler extract', async function(assert) {
    let loaded = false

    const counter = handleableBuilder(
      config => {
        assert.equal(loaded, false, 'should be loaded only once')
        loaded = true

        let count = 0

        const getCount = args =>
          `${count}`

        const increment = args => {
          const amount = args.get('amount') || 1

          count = count + amount

          return { newCount: count }
        }

        const decrement = (args, streamable) =>
          textToStreamable(`new count: ${--count}`)

        return createHandleable({
          getCount, increment, decrement
        })
      })

    const getCountComponent = counter::extractSimpleHandler('getCount', {
      inputType: 'empty',
      outputType: 'text'
    })

    const incrementComponent = counter::extractSimpleHandler('increment', {
      inputType: 'empty',
      outputType: 'json'
    })

    const decrementComponent = counter::extractStreamHandler('decrement')

    const config = createConfig()
    const getCount = await loadHandler(config, getCountComponent)
    const increment = await loadHandler(config, incrementComponent)
    const decrement = await loadHandler(config, decrementComponent)

    const args = createArgs()

    const result1 = await getCount(args)
    assert.equal(result1, '0')

    const result2 = await increment(args.set('amount', 2))
    assert.equal(result2.newCount, 2)

    const resultStreamable3 = await decrement(args, emptyStreamable())
    const result3 = await streamableToText(resultStreamable3)
    assert.equal(result3, 'new count: 1')

    const result4 = await getCount(args)
    assert.equal(result4, '1')

    assert.end()
  })

  assert.end()
})
