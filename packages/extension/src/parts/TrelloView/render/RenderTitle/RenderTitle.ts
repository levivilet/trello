import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

export const renderTitle = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloTitle',
      type: VirtualDomElements.H2,
    },
    text(value),
  ]
}
