import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

const listTitleNode: VirtualDomNode = {
  childCount: 1,
  className: 'TrelloListTitle',
  type: VirtualDomElements.H3,
}

export const renderListTitle = (value: string): readonly VirtualDomNode[] => {
  return [listTitleNode, text(value)]
}
