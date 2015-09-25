import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { simpleHandler } from 'quiver-component-basic/constructor'
import { createArgs } from 'quiver-component-basic/util'
import {
  loadHandler, createConfig
} from 'quiver-component-base/util'

import { filterArgs } from '../lib/method'

test('args filter test', assert => {
  assert::asyncTest('should filter args', async function(assert) {
    const main = simpleHandler((args, name) => {
      assert.equal(args.get('foo'), 'modified')
      assert.equal(args.get('bar'), 'beer')

      return `hello, ${name}`

    }, {
      inputType: 'text',
      outputType: 'text'

    })::filterArgs(args => {
      assert.equal(args.get('foo'), 'food')
      return args.set('foo', 'modified')
    })

    const handler = await loadHandler(createConfig(), main)

    const args = createArgs({
      foo: 'food',
      bar: 'beer'
    })

    const result = await handler(args, 'john')
    assert.equal(result, 'hello, john')

    assert.end()
  })

  assert.end()
})
