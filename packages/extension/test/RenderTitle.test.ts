import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderTitle } from '../src/parts/RenderTitle/RenderTitle.ts'

test('renders the title', () => {
  expect(renderTitle('Boards')).toEqual([
    {
      childCount: 1,
      className: 'TrelloTitle',
      type: VirtualDomElements.H2,
    },
    {
      childCount: 0,
      text: 'Boards',
      type: VirtualDomElements.Text,
    },
  ])
})
