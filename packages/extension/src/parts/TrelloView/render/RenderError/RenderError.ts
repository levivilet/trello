import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

export const renderError = (error: string): readonly VirtualDomNode[] => {
  if (!error) {
    return []
  }
  return [
    {
      childCount: 1,
      className: 'TrelloError',
      type: VirtualDomElements.Div,
    },
    text(error),
  ]
}
