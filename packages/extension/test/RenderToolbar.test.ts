import { expect, test } from '@jest/globals'
import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import { renderToolbar } from '../src/parts/RenderToolbar/RenderToolbar.ts'

test('renders an empty toolbar', () => {
  expect(renderToolbar([])).toEqual([
    {
      childCount: 0,
      className: 'TrelloToolbar',
      type: VirtualDomElements.Div,
    },
  ])
})

test('renders and flattens toolbar children', () => {
  const first: readonly VirtualDomNode[] = [
    {
      childCount: 0,
      type: VirtualDomElements.Input,
    },
  ]
  const second: readonly VirtualDomNode[] = [
    {
      childCount: 1,
      type: VirtualDomElements.Button,
    },
    text('Submit'),
  ]

  expect(renderToolbar([first, second])).toEqual([
    {
      childCount: 2,
      className: 'TrelloToolbar',
      type: VirtualDomElements.Div,
    },
    ...first,
    ...second,
  ])
})
