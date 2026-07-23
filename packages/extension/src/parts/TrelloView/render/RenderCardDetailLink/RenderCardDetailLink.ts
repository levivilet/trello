import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'

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
    text(TrelloStrings.openInTrello()),
  ]
}
