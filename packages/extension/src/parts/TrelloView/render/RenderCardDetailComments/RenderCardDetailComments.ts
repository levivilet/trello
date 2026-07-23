import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloComment } from '../../../TrelloTypes/TrelloTypes.ts'
import { renderCardDetailComment } from '../RenderCardDetailComment/RenderCardDetailComment.ts'

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
      text('Loading comments...'),
    ]
  }
  if (comments.length === 0) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardDetailEmpty',
        type: VirtualDomElements.Div,
      },
      text('No comments'),
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
