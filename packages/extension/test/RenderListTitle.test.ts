import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderListTitle } from '../src/parts/TrelloView/render/RenderListTitle/RenderListTitle.ts'

test('renders the list title', () => {
  expect(renderListTitle('Recently viewed')).toEqual([
    {
      childCount: 1,
      className: 'TrelloListTitle',
      type: VirtualDomElements.H3,
    },
    {
      childCount: 0,
      text: 'Recently viewed',
      type: VirtualDomElements.Text,
    },
  ])
})
