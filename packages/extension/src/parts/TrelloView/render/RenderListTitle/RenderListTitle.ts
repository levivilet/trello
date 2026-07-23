import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

export const renderListTitle = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloListTitle',
      type: VirtualDomElements.H3,
    },
    text(value),
  ]
}
