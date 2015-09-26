import test from 'tape'
import { asyncTest } from 'quiver-util/tape'
import { createArgs } from 'quiver-component-basic/util'
import { simpleHandler } from 'quiver-component-basic/constructor'
import { textToStreamable } from 'quiver-stream-util'

import {
  loadHandler, createConfig
} from 'quiver-component-base/util'

import { handleError } from '../lib/method'

test('error filter test', assert => {
  assert::asyncTest('should recover error', async function(assert) {
    const main = simpleHandler(
      args => {
        throw new Error('error in main')
      }, {
        inputType: 'empty',
        outputType: 'text'
      })
      ::handleError(err => {
        assert.equal(err.message, 'error in main')
        return textToStreamable('recovered result')
      })

    const handler = await loadHandler(createConfig(), main)
    const result = await handler(createArgs())

    assert.equal(result, 'recovered result',
      'should get recovered result')

    assert.end()
  })

  assert.end()
})
