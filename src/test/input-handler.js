import test from 'tape'
import { asyncTest } from 'quiver-util/tape'

import { createArgs } from 'quiver-component-basic/util'
import { createConfig, loadHandler } from 'quiver-component-base/util'

import { simpleHandler, simpleHandlerBuilder } from 'quiver-component-basic/constructor'

import { inputHandler } from '../lib/method'

test('input handler component test', assert => {
    assert::asyncTest('should load inner handler', async function(assert) {
      assert.plan(3)

      const innerHandler = simpleHandler(
        (args, body) => `Hello, ${ args.get('name') }. You said ${body}.`,
        {
          inputType: 'text',
          outputType: 'text'
        })

      const main = simpleHandlerBuilder(
        async function(config) {
          const inner = config.get('inner')
          assert.ok(inner)

          const result = await inner(
            createArgs({ name: 'John' }),
            'bonjour')

          assert.equal(result, 'Hello, John. You said bonjour.',
            'should call inner handler successfully with right handler signature.')

          return () => 'hello world'

        }, {
          inputType: 'empty',
          outputType: 'text'
        })
        ::inputHandler('inner', innerHandler)

      const handler = await loadHandler(createConfig(), main)

      const result = await handler(createArgs())
      assert.equal(result, 'hello world')

      assert.end()
    })
})
