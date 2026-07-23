import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

export const renderCardDetailLink = (
  url: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloCardDetailLink',
      href: url,
      target: '_blank',
      type: VirtualDomElements.A,
    },
    text('Open in Trello'),
  ]
}
