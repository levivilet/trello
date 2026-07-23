import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderError } from '../src/parts/RenderError/RenderError.ts'

test('returns no nodes when the error is empty', () => {
  expect(renderError('')).toEqual([])
})

test('renders the error message', () => {
  expect(renderError('Request failed')).toEqual([
    {
      childCount: 1,
      className: 'TrelloError',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: 'Request failed',
      type: VirtualDomElements.Text,
    },
  ])
})
