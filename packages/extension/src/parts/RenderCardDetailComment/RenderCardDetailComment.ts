import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloComment } from '../TrelloTypes/TrelloTypes.ts'
import {
  getCommentAuthor,
  getCommentAvatarUrl,
  getCommentDateText,
  getCommentText,
} from '../CommentHelpers/CommentHelpers.ts'
import { renderCardDetailAvatar } from '../RenderCardDetailAvatar/RenderCardDetailAvatar.ts'

const renderCommentDate = (dateText: string): readonly VirtualDomNode[] => {
  if (!dateText) {
    return []
  }
  return [
    {
      childCount: 1,
      className: 'TrelloCardCommentDate',
      type: VirtualDomElements.Div,
    },
    text(dateText),
  ]
}

export const renderCardDetailComment = (
  comment: Readonly<TrelloComment>,
): readonly VirtualDomNode[] => {
  const author = getCommentAuthor(comment)
  const avatarUrl = getCommentAvatarUrl(comment)
  const dateText = getCommentDateText(comment)
  const commentText = getCommentText(comment)
  return [
    {
      childCount: 2,
      className: 'TrelloCardComment',
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailAvatar(comment, author, avatarUrl),
    {
      childCount: 2,
      className: 'TrelloCardCommentContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1 + (dateText ? 1 : 0),
      className: 'TrelloCardCommentHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloCardCommentAuthor',
      type: VirtualDomElements.Div,
    },
    text(author),
    ...renderCommentDate(dateText),
    {
      childCount: 1,
      className: 'TrelloCardCommentText',
      type: VirtualDomElements.Div,
    },
    text(commentText),
  ]
}
