import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloComment } from '../TrelloTypes/TrelloTypes.ts'
import { getCommentInitials } from '../CommentHelpers/CommentHelpers.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardDetailAvatar = (
  comment: Readonly<TrelloComment>,
  author: string,
  avatarUrl: string,
): readonly VirtualDomNode[] => {
  if (avatarUrl) {
    return [
      {
        alt: TrelloStrings.avatar(author),
        childCount: 0,
        className: 'TrelloCardCommentAvatar',
        src: avatarUrl,
        type: VirtualDomElements.Img,
      },
    ]
  }
  return [
    {
      childCount: 1,
      className: 'TrelloCardCommentAvatar',
      type: VirtualDomElements.Div,
    },
    text(getCommentInitials(comment)),
  ]
}
