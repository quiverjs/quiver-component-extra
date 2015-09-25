import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { ImmutableMap } from 'quiver-util/immutable'

import {
  createArgs, simpleHandlerLoader
} from 'quiver-component-basic/util'

import {
  simpleHandler, simpleHandlerBuilder
} from 'quiver-component-basic/constructor'

import {
  loadHandler, createConfig
} from 'quiver-component-base/util'

import { inputHandler, implement } from '../lib/method'

import { abstractHandler, abstractMiddleware } from '../lib/constructor'

test('abstract component test', assert => {
  assert.test('basic abstract handler test', assert => {
    const foo = abstractHandler('foo')
    assert.throws(() => foo.handleableBuilderFn())

    const barImpl = simpleHandler(
      args => 'beer', {
        inputType: 'empty',
        outputType: 'text'
      })

    foo.implement(ImmutableMap({
      bar: barImpl
    }))

    assert.throws(() => foo.handleableBuilderFn(),
      'should not implement components in other keys')

    const fooImpl = simpleHandler(
      args => 'food', {
        inputType: 'empty',
        outputType: 'text'
      })

    foo.implement(ImmutableMap({
      foo: fooImpl,
      bar: barImpl
    }))

    const builder = foo.handleableBuilderFn()
    assert.ok(builder)

    assert.equal(foo.concreteComponent, fooImpl)

    const fooImpl2 = simpleHandler(
      args => 'fool', {
        inputType: 'empty',
        outputType: 'text'
      })

    foo.implement(ImmutableMap({
      foo: fooImpl2
    }))

    assert.equal(foo.concreteComponent, fooImpl,
      'concrete component binding should not change once set')

    assert.notEqual(foo.concreteComponent, fooImpl2)

    assert.end()
  })

  assert.test('default component test', assert => {
    const defaultImpl = simpleHandler(
      args => 'default', {
        inputType: 'empty',
        outputType: 'text'
      })

    const foo = abstractHandler('foo', {
      defaultComponent: defaultImpl
    })

    assert.equal(foo.concreteComponent, defaultImpl)

    const fooImpl = simpleHandler(
      args => 'food', {
        inputType: 'empty',
        outputType: 'text'
      })

    foo.implement(ImmutableMap({
      foo: fooImpl
    }))

    assert.equal(foo.concreteComponent, fooImpl)
    assert.end()
  })

  assert::asyncTest('abstract input handler', async function(assert) {
    const foo = abstractHandler('foo')
      .setLoader(simpleHandlerLoader('text', 'text'))

    const main = simpleHandlerBuilder(config => {
      const fooHandler = config.get('foo')

      return async function(args, body) {
        const name = args.get('name')
        const fooResult = await fooHandler(createArgs(), body)

        return `Hello ${name}, foo said ${fooResult}`
      }
    }, {
      inputType: 'text',
      outputType: 'text'
    })
    ::inputHandler('foo', foo)

    const createApp = main.export()

    await assert::asyncTest('concrete first app', async function(assert) {
      const app1 = createApp()

      const uppercase = simpleHandler(
        (args, body) =>
          (body.toUpperCase() + '!!'),
        {
          inputType: 'text',
          outputType: 'text'
        })

      app1::implement({
        foo: uppercase
      })

      const handler1 = await loadHandler(createConfig(), app1)

      const args = createArgs({ name: 'John' })
      const result1 = await handler1(args, 'Bonjour')

      assert.equal(result1, 'Hello John, foo said BONJOUR!!',
        'should be able to call implemented abstract input handler')

      assert.end()
    })

    await assert::asyncTest('concrete second app', async function(assert) {
      const app2 = createApp()
      assert.throws(() => app2.handleableBuilderFn(),
        'new component should not share unimplemented abstract component')

      const lowercase = simpleHandler(
        (args, body) =>
          (body.toLowerCase() + '..'),
        {
          inputType: 'text',
          outputType: 'text'
        })

      app2::implement({
        foo: lowercase
      })

      const handler2 = await loadHandler(createConfig(), app2)

      const args = createArgs({ name: 'John' })
      const result2 = await handler2(args, 'Bonjour')

      assert.equal(result2, 'Hello John, foo said bonjour..',
        'should be able to bind to different concrete component')

      assert.end()
    })

    assert.end()
  })

  assert.end()
})
