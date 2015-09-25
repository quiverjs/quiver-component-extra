import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { handleableBuilder } from 'quiver-component-base/constructor'
import {
  loadHandler, createConfig, createHandleable
} from 'quiver-component-base/util'

import { aliasConfig, overrideConfig } from '../lib/method'

test('config alias/override test', assert => {
  assert::asyncTest('config override test', async function(assert) {
    const main = handleableBuilder(config => {
      assert.equal(config.get('foo'), 'modified')
      assert.equal(config.get('bar'), 'beer')

      return createHandleable({ baz: 'buzz' })

    })::overrideConfig({
      foo: 'modified'
    })

    const config = createConfig({
      foo: 'food',
      bar: 'beer'
    })

    const handleable = await loadHandler(config, main)
    assert.equal(handleable.get('baz'), 'buzz')

    assert.end()
  })

  assert::asyncTest('config alias test', async function(assert) {
    const main = handleableBuilder(config => {
      assert.equal(config.get('foo'), 'aliased')
      assert.equal(config.get('bar'), 'beer')

      return createHandleable({ baz: 'buzz' })

    })::aliasConfig({
      foo: 'alias'
    })

    const config = createConfig({
      foo: 'food',
      bar: 'beer',
      alias: 'aliased'
    })

    const handleable = await loadHandler(config, main)
    assert.equal(handleable.get('baz'), 'buzz')

    assert.end()
  })

  assert.end()
})
