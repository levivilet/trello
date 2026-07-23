import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloComment } from '../TrelloTypes/TrelloTypes.ts'
import { renderCardDetailComment } from '../RenderCardDetailComment/RenderCardDetailComment.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardDetailComments = (
  loading: boolean,
  comments: readonly TrelloComment[],
): readonly VirtualDomNode[] => {
  if (loading) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardDetailEmpty',
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.loadingComments()),
    ]
  }
  if (comments.length === 0) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardDetailEmpty',
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.noComments()),
    ]
  }
  return [
    {
      childCount: comments.length,
      className: 'TrelloCardComments',
      type: VirtualDomElements.Div,
    },
    ...comments.flatMap(renderCardDetailComment),
  ]
}
