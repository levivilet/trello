import type {
  TrelloAttachment,
  TrelloComment,
  TrelloLabel,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as Dom from '../../VirtualDom/VirtualDom.ts'
import {
  getAttachmentImageUrl,
  isImageAttachment,
} from '../AttachmentHelpers.ts'
import { getCommentAuthor, getCommentText } from '../CommentHelpers.ts'
import { getLabelColorClassName, getLabelText } from '../LabelHelpers.ts'
import {
  renderField,
  renderListTitle,
  renderTextAreaField,
} from './RenderShared.ts'

const renderImageAttachment = (
  attachment: Readonly<TrelloAttachment>,
): Dom.TreeNode => {
  return Dom.image(
    'TrelloCardDetailImage',
    getAttachmentImageUrl(attachment),
    attachment.name || 'Card attachment',
  )
}

const renderCardDetailImages = (
  attachments: readonly TrelloAttachment[],
): Dom.TreeNode => {
  const imageAttachments = attachments.filter(isImageAttachment)
  if (imageAttachments.length === 0) {
    return Dom.div('TrelloCardDetailEmpty', [Dom.textNode('No images')])
  }
  return Dom.div(
    'TrelloCardDetailImages',
    imageAttachments.map(renderImageAttachment),
  )
}

const renderCardDetailComment = (
  comment: Readonly<TrelloComment>,
): Dom.TreeNode => {
  const author = Dom.textNode(getCommentAuthor(comment))
  const text = Dom.textNode(getCommentText(comment))
  return Dom.div('TrelloCardComment', [
    Dom.div('TrelloCardCommentAuthor', [author]),
    Dom.div('TrelloCardCommentText', [text]),
  ])
}

const renderCardDetailComments = (
  comments: readonly TrelloComment[],
): Dom.TreeNode => {
  if (comments.length === 0) {
    return Dom.div('TrelloCardDetailEmpty', [Dom.textNode('No comments')])
  }
  return Dom.div('TrelloCardComments', comments.map(renderCardDetailComment))
}

const renderCardDetailLabel = (label: Readonly<TrelloLabel>): Dom.TreeNode => {
  return Dom.div(`TrelloCardLabel ${getLabelColorClassName(label.color)}`, [
    Dom.textNode(getLabelText(label)),
  ])
}

const renderCardDetailLabels = (
  labels: readonly TrelloLabel[] | undefined,
): readonly Dom.TreeNode[] => {
  if (!labels || labels.length === 0) {
    return []
  }
  return [Dom.div('TrelloCardLabels', labels.map(renderCardDetailLabel))]
}

export const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly Dom.TreeNode[] => {
  if (state.cardDetailLoading) {
    return [
      Dom.div('TrelloCardDetailPanel', [
        renderListTitle('Card details'),
        Dom.textNode('Loading card...'),
      ]),
    ]
  }
  if (!state.selectedCardDetail) {
    return []
  }
  const { attachments, card, comments } = state.selectedCardDetail
  const descriptionPreview =
    state.draftCardDescription.trim() || 'No description'
  const children = [
    Dom.button('closeCardDetail', 'Close'),
    renderField('Title', 'cardTitle', state.draftCardTitle),
    ...renderCardDetailLabels(card.labels),
    renderTextAreaField(
      'Description',
      'cardDescription',
      state.draftCardDescription,
    ),
    Dom.button('saveCardDetail', state.savingCardDetail ? 'Saving...' : 'Save'),
    Dom.div('TrelloCardDescription', [Dom.textNode(descriptionPreview)]),
    renderListTitle('Comments'),
    renderCardDetailComments(comments),
    renderListTitle('Images'),
    renderCardDetailImages(attachments),
    ...(card.url
      ? [Dom.link('TrelloCardDetailLink', card.url, 'Open in Trello')]
      : []),
  ]
  return [Dom.div('TrelloCardDetailPanel', children)]
}
