import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { ImmutableMap } from 'quiver-util/immutable'

import {
  createArgs, simpleHandlerLoader
} from 'quiver-component-basic/util'

import { handleableFilter } from 'quiver-component-basic/constructor'
import { handleableBuilder } from 'quiver-component-base/constructor'

import {
  loadHandler, createConfig, createHandleable
} from 'quiver-component-base/util'

import { extendHandler } from '../lib/constructor'

test('extend component test', assert => {
  assert::asyncTest('extend handler test', async function(assert) {
    let loaded = false

    const main = handleableBuilder(
      config => {
        assert.equal(loaded, false,
          'component should be singleton and loaded once')

        loaded = true

        return createHandleable({
          foo: 'food'
        })
      })
      .addMiddleware(handleableFilter(
        (config, handleable) => {
          assert.equal(handleable.get('foo'), 'food')
          return handleable.set('bar', 'beer')
        }))

    const extended = extendHandler(main)
      .addMiddleware(handleableFilter(
        (config, handleable) => {
          assert.equal(handleable.get('foo'), 'food')
          assert.equal(handleable.get('bar'), 'beer')
          return handleable.set('baz', 'buzz')
        }))

    const config = createConfig()

    const handleable1 = await loadHandler(config, main)

    assert.equal(handleable1.get('foo'), 'food')
    assert.equal(handleable1.get('bar'), 'beer')
    assert.notOk(handleable1.get('baz'))

    const handleable2 = await loadHandler(config, extended)

    assert.equal(handleable2.get('foo'), 'food')
    assert.equal(handleable2.get('bar'), 'beer')
    assert.equal(handleable2.get('baz'), 'buzz')

    assert.end()
  })

  assert.end()
})
