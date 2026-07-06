import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
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
import {
  getCommentAuthor,
  getCommentAvatarUrl,
  getCommentDateText,
  getCommentInitials,
  getCommentText,
} from '../CommentHelpers.ts'
import { getLabelColorClassName, getLabelText } from '../LabelHelpers.ts'
import { renderMarkdown } from './RenderMarkdown.ts'
import { renderListTitle } from './RenderShared.ts'

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
  const author = getCommentAuthor(comment)
  const avatarUrl = getCommentAvatarUrl(comment)
  const dateText = getCommentDateText(comment)
  const commentText = getCommentText(comment)
  const commentTextNode = Dom.textNode(commentText)
  const commentTextElement = Dom.div('TrelloCardCommentText', [commentTextNode])
  const headerChildren = [
    Dom.div('TrelloCardCommentAuthor', [Dom.textNode(author)]),
    ...(dateText
      ? [Dom.div('TrelloCardCommentDate', [Dom.textNode(dateText)])]
      : []),
  ]
  const avatar = avatarUrl
    ? Dom.image('TrelloCardCommentAvatar', avatarUrl, `${author} avatar`)
    : Dom.div('TrelloCardCommentAvatar', [
        Dom.textNode(getCommentInitials(comment)),
      ])
  return Dom.div('TrelloCardComment', [
    avatar,
    Dom.div('TrelloCardCommentContent', [
      Dom.div('TrelloCardCommentHeader', headerChildren),
      commentTextElement,
    ]),
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

const renderCardDetailTitle = (
  state: Readonly<TrelloViewState>,
): Dom.TreeNode => {
  const className = state.editingCardTitle
    ? 'TrelloCardDetailTitleInput TrelloCardDetailTitleInputEditing'
    : 'TrelloCardDetailTitleInput'
  return Dom.div('TrelloCardDetailTitleSizer', [
    Dom.node(VirtualDomElements.TextArea, {
      className,
      name: 'cardTitle',
      onBlur: 'handleBlur',
      onClick: 'handleClick',
      onFocus: 'handleFocus',
      onInput: 'handleInput',
      rows: 1,
      value: state.draftCardTitle,
    }),
    Dom.node(
      VirtualDomElements.Div,
      {
        ariaHidden: true,
        className: 'TrelloCardDetailTitleMirror',
      },
      [Dom.textNode(state.draftCardTitle || ' ')],
    ),
  ])
}

const renderCardDescriptionEditor = (
  state: Readonly<TrelloViewState>,
): Dom.TreeNode => {
  return Dom.div('TrelloCardDescriptionEditor', [
    Dom.node(VirtualDomElements.TextArea, {
      className: 'TrelloTextArea TrelloCardDescriptionTextArea',
      name: 'cardDescription',
      onBlur: 'handleBlur',
      onFocus: 'handleFocus',
      onInput: 'handleInput',
      placeholder: 'Add a more detailed description...',
      value: state.draftCardDescription,
    }),
    Dom.div('TrelloCardDetailActions', [
      Dom.button(
        'saveCardDetail',
        state.savingCardDetail ? 'Saving...' : 'Save',
        'TrelloButton TrelloCardDetailSaveButton',
      ),
    ]),
  ])
}

const renderCardDescriptionPreview = (description: string): Dom.TreeNode => {
  const trimmedDescription = description.trim()
  if (!trimmedDescription) {
    return Dom.node(
      VirtualDomElements.Div,
      {
        className:
          'TrelloCardDescriptionPreview TrelloCardDescriptionPlaceholder',
        name: 'editCardDescription',
        onClick: 'handleClick',
      },
      [Dom.textNode('Add a more detailed description...')],
    )
  }
  return Dom.node(
    VirtualDomElements.Div,
    {
      className: 'TrelloCardDescriptionPreview',
      name: 'editCardDescription',
      onClick: 'handleClick',
    },
    renderMarkdown(description),
  )
}

const renderCardDescription = (
  state: Readonly<TrelloViewState>,
  description: string,
): Dom.TreeNode => {
  return Dom.div('TrelloCardDescriptionSection', [
    Dom.node(
      VirtualDomElements.H3,
      { className: 'TrelloCardDetailSectionTitle' },
      [Dom.textNode('Description')],
    ),
    state.editingCardDescription
      ? renderCardDescriptionEditor(state)
      : renderCardDescriptionPreview(description),
  ])
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
  const children = [
    Dom.div('TrelloCardDetailHeader', [
      renderCardDetailTitle(state),
      Dom.button(
        'closeCardDetail',
        'x',
        'TrelloButton TrelloCardDetailCloseButton',
      ),
    ]),
    ...renderCardDetailLabels(card.labels),
    renderCardDescription(state, card.desc || ''),
    renderListTitle('Comments'),
    renderCardDetailComments(comments),
    renderListTitle('Images'),
    renderCardDetailImages(attachments),
    ...(card.url
      ? [Dom.link('TrelloCardDetailLink', card.url, 'Open in Trello')]
      : []),
  ]
  return [
    Dom.node(
      VirtualDomElements.Div,
      {
        className: 'TrelloCardDetailPanel',
        name: 'cardDetail',
        onContextMenu: 'handleContextMenu',
      },
      children,
    ),
  ]
}
