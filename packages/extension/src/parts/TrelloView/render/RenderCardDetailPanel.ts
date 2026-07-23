import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloAttachment,
  TrelloCard,
  TrelloComment,
  TrelloLabel,
  TrelloList,
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
import {
  getLabelColorClassName,
  getLabelText,
  labelColors,
} from '../LabelHelpers.ts'
import { renderMarkdown } from './RenderMarkdown.ts'
import { renderListTitle } from './RenderShared.ts'

const renderImageAttachment = (
  attachment: Readonly<TrelloAttachment>,
  attachmentImageUrls: Readonly<Record<string, string>>,
  failed: boolean,
): Dom.TreeNode => {
  const sourceUrl = getAttachmentImageUrl(attachment)
  const imageUrl = attachmentImageUrls[sourceUrl]
  if (failed || !imageUrl) {
    return Dom.div('TrelloCardDetailImageError', [
      Dom.textNode('Image could not be loaded.'),
    ])
  }
  return Dom.node(VirtualDomElements.Img, {
    alt: attachment.name || 'Card attachment',
    className: 'TrelloCardDetailImage',
    name: attachment.id,
    onError: 'handleImageError',
    src: imageUrl,
  })
}

const renderCardDetailImages = (
  loading: boolean,
  attachments: readonly TrelloAttachment[],
  attachmentImageUrls: Readonly<Record<string, string>>,
  failedImageIds: readonly string[],
): readonly Dom.TreeNode[] => {
  if (loading) {
    return [
      renderListTitle('Images'),
      Dom.div('TrelloCardDetailEmpty', [Dom.textNode('Loading images...')]),
    ]
  }
  const imageAttachments = attachments.filter(isImageAttachment)
  if (imageAttachments.length === 0) {
    return []
  }
  return [
    renderListTitle('Images'),
    Dom.div(
      'TrelloCardDetailImages',
      imageAttachments.map((attachment) =>
        renderImageAttachment(
          attachment,
          attachmentImageUrls,
          failedImageIds.includes(attachment.id),
        ),
      ),
    ),
  ]
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
  loading: boolean,
  comments: readonly TrelloComment[],
): Dom.TreeNode => {
  if (loading) {
    return Dom.div('TrelloCardDetailEmpty', [
      Dom.textNode('Loading comments...'),
    ])
  }
  if (comments.length === 0) {
    return Dom.div('TrelloCardDetailEmpty', [Dom.textNode('No comments')])
  }
  return Dom.div('TrelloCardComments', comments.map(renderCardDetailComment))
}

const renderCardCommentButton = (
  name: string,
  label: string,
  className: string,
  disabled: boolean,
): Dom.TreeNode => {
  const text = Dom.textNode(label)
  return Dom.node(
    VirtualDomElements.Button,
    {
      className,
      disabled,
      name,
      onClick: 'handleClick',
    },
    [text],
  )
}

const renderCardCommentComposer = (
  state: Readonly<TrelloViewState>,
): Dom.TreeNode => {
  if (!state.writingComment) {
    return Dom.button(
      'startWriteComment',
      'Write a comment',
      'TrelloButton TrelloCardCommentWriteButton',
    )
  }
  return Dom.div('TrelloCardCommentComposer', [
    Dom.node(VirtualDomElements.TextArea, {
      autofocus: true,
      className: 'TrelloTextArea TrelloCardCommentTextArea',
      disabled: state.savingComment,
      name: 'cardComment',
      onInput: 'handleInput',
      onKeyDown: 'handleKeyDown',
      placeholder: 'Write a comment...',
      value: state.draftComment,
    }),
    Dom.div('TrelloCardCommentActions', [
      renderCardCommentButton(
        'submitComment',
        state.savingComment ? 'Saving...' : 'Save',
        'TrelloButton TrelloCardCommentSaveButton',
        state.savingComment,
      ),
      renderCardCommentButton(
        'cancelWriteComment',
        'Cancel',
        'TrelloButton TrelloCardCommentCancelButton',
        state.savingComment,
      ),
    ]),
  ])
}

const renderCardDetailLabel = (label: Readonly<TrelloLabel>): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: `TrelloCardLabel TrelloCardLabelButton ${getLabelColorClassName(label.color)}`,
      name: 'openCardLabelPicker',
      onClick: 'handleClick',
    },
    [Dom.textNode(getLabelText(label))],
  )
}

const hasCardLabel = (
  labels: readonly TrelloLabel[] | undefined,
  labelId: string,
): boolean => {
  return Boolean(
    labels?.some((label) => {
      return label.id === labelId
    }),
  )
}

const getMatchingLabels = (
  state: Readonly<TrelloViewState>,
): readonly TrelloLabel[] => {
  const query = state.draftLabelSearchQuery.trim().toLowerCase()
  return state.boardLabels.filter((label) => {
    if (!query) {
      return true
    }
    return getLabelText(label).toLowerCase().includes(query)
  })
}

const renderCardLabelChoice = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
  label: Readonly<TrelloLabel>,
): Dom.TreeNode => {
  const checked = hasCardLabel(labels, label.id)
  const checkbox = Dom.node(VirtualDomElements.Input, {
    checked,
    className: 'TrelloCardLabelChoiceCheckbox',
    inputType: 'checkbox',
    name: `cardLabelCheckbox:${label.id}`,
    tabIndex: -1,
  })
  const text = Dom.node(
    VirtualDomElements.Span,
    {
      className: `TrelloCardLabelChoiceText ${getLabelColorClassName(label.color)}`,
    },
    [Dom.textNode(getLabelText(label))],
  )
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: 'TrelloCardLabelChoice',
      disabled: Boolean(state.addingCardLabelId),
      name: `addCardLabel:${label.id}`,
      onClick: 'handleClick',
    },
    [checkbox, text],
  )
}

const renderCardLabelPickerContent = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): Dom.TreeNode => {
  if (state.boardLabelsLoading) {
    return Dom.div('TrelloCardLabelPickerEmpty', [
      Dom.textNode('Loading labels...'),
    ])
  }
  const matchingLabels = getMatchingLabels(state)
  if (matchingLabels.length === 0) {
    if (state.draftLabelSearchQuery.trim()) {
      return Dom.button(
        'openCardLabelCreate',
        'Create a new label',
        'TrelloButton TrelloCardLabelCreateButton',
      )
    }
    return Dom.div('TrelloCardLabelPickerEmpty', [
      Dom.textNode('No labels available'),
    ])
  }
  return Dom.div(
    'TrelloCardLabelPickerList',
    matchingLabels.map((label) => {
      return renderCardLabelChoice(state, labels, label)
    }),
  )
}

const renderCardLabelPickerHeader = (): Dom.TreeNode => {
  const title = Dom.div('TrelloCardLabelPickerTitle', [Dom.textNode('Labels')])
  const closeButton = Dom.button(
    'closeCardLabelPicker',
    'x',
    'TrelloButton TrelloCardLabelPickerCloseButton',
  )
  return Dom.div('TrelloCardLabelPickerHeader', [title, closeButton])
}

const renderCardLabelCreateHeader = (): Dom.TreeNode => {
  const backButton = Dom.button(
    'closeCardLabelCreate',
    '<',
    'TrelloButton TrelloCardLabelPickerBackButton',
  )
  const title = Dom.div('TrelloCardLabelPickerTitle', [
    Dom.textNode('Create label'),
  ])
  const closeButton = Dom.button(
    'closeCardLabelPicker',
    'x',
    'TrelloButton TrelloCardLabelPickerCloseButton',
  )
  return Dom.div('TrelloCardLabelPickerHeader', [
    backButton,
    title,
    closeButton,
  ])
}

const renderCardLabelColorChoice = (
  state: Readonly<TrelloViewState>,
  color: string,
): Dom.TreeNode => {
  const selected = state.draftNewLabelColor === color
  return Dom.node(VirtualDomElements.Button, {
    'aria-label': `Select ${color.replace('_', ' ')} label color`,
    'aria-pressed': selected,
    className: `TrelloCardLabelColorChoice ${getLabelColorClassName(color)}${selected ? ' TrelloCardLabelColorChoiceSelected' : ''}`,
    disabled: state.savingNewLabel,
    name: `selectCardLabelColor:${color}`,
    onClick: 'handleClick',
    title: color.replace('_', ' '),
  })
}

const renderCardLabelCreate = (
  state: Readonly<TrelloViewState>,
): Dom.TreeNode => {
  const preview = Dom.div(
    `TrelloCardLabelCreatePreview ${getLabelColorClassName(state.draftNewLabelColor)}`,
    [Dom.textNode(state.draftNewLabelName || 'Label title')],
  )
  const titleInput = Dom.node(VirtualDomElements.Input, {
    autocomplete: 'off',
    className: 'TrelloInput',
    disabled: state.savingNewLabel,
    name: 'newLabelName',
    onFocus: 'handleFocus',
    onInput: 'handleInput',
    placeholder: 'Label title',
    value: state.draftNewLabelName,
  })
  const colorChoices = Dom.div(
    'TrelloCardLabelColorGrid',
    labelColors.map((color) => {
      return renderCardLabelColorChoice(state, color)
    }),
  )
  const createButton = Dom.node(
    VirtualDomElements.Button,
    {
      className: 'TrelloButton TrelloPrimaryButton',
      disabled: state.savingNewLabel || !state.draftNewLabelName.trim(),
      name: 'createCardLabel',
      onClick: 'handleClick',
    },
    [Dom.textNode(state.savingNewLabel ? 'Creating...' : 'Create')],
  )
  return Dom.div('TrelloCardLabelCreate', [
    renderCardLabelCreateHeader(),
    preview,
    Dom.div('TrelloCardLabelCreateFields', [
      Dom.label('Title'),
      titleInput,
      Dom.label('Select a color'),
      colorChoices,
      createButton,
    ]),
  ])
}

const renderCardLabelPicker = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Div,
    {
      className: 'TrelloCardLabelPicker',
      name: 'cardLabelPicker',
      onPointerDown: 'handleCardLabelPickerPointerDown',
    },
    state.cardLabelCreateOpen
      ? [renderCardLabelCreate(state)]
      : [
          renderCardLabelPickerHeader(),
          Dom.node(VirtualDomElements.Input, {
            autocomplete: 'off',
            className: 'TrelloInput TrelloCardLabelSearchInput',
            name: 'cardLabelSearch',
            onBlur: 'handleBlur',
            onFocus: 'handleFocus',
            onInput: 'handleInput',
            placeholder: 'Search labels',
            value: state.draftLabelSearchQuery,
          }),
          renderCardLabelPickerContent(state, labels),
        ],
  )
}

const renderCardDetailLabels = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly Dom.TreeNode[] => {
  const labelNodes =
    labels && labels.length > 0
      ? [
          Dom.div('TrelloCardLabelRow', [
            Dom.div('TrelloCardLabels', labels.map(renderCardDetailLabel)),
            Dom.button(
              'openCardLabelPicker',
              '+',
              'TrelloButton TrelloCardLabelAddIconButton',
            ),
          ]),
        ]
      : [
          Dom.button(
            'openCardLabelPicker',
            'Labels',
            'TrelloButton TrelloCardLabelAddButton',
          ),
        ]
  return [
    Dom.div('TrelloCardLabelSection', [
      ...labelNodes,
      ...(state.cardLabelPickerOpen
        ? [renderCardLabelPicker(state, labels)]
        : []),
    ]),
  ]
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

const getCardListId = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): string => {
  if (card.idList) {
    return card.idList
  }
  const lists = state.boardDetail?.lists || []
  const list = lists.find((item) => {
    return item.cards.some((listCard) => {
      return listCard.id === card.id
    })
  })
  return list?.id || ''
}

const renderCardListOption = (
  list: Readonly<TrelloList>,
  selectedListId: string,
): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Option,
    {
      selected: list.id === selectedListId,
      value: list.id,
    },
    [Dom.textNode(list.name)],
  )
}

const renderCardListSelect = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): readonly Dom.TreeNode[] => {
  const lists = state.boardDetail?.lists || []
  if (lists.length === 0) {
    return []
  }
  const selectedListId = getCardListId(state, card)
  return [
    Dom.div('TrelloCardListSection', [
      Dom.node(VirtualDomElements.Label, { className: 'TrelloCardListLabel' }, [
        Dom.textNode('List'),
      ]),
      Dom.node(
        VirtualDomElements.Select,
        {
          className: 'TrelloInput TrelloCardListSelect',
          disabled: state.movingCardId === card.id,
          name: `cardList:${card.id}`,
          onInput: 'handleInput',
          value: selectedListId,
        },
        lists.map((list) => {
          return renderCardListOption(list, selectedListId)
        }),
      ),
    ]),
  ]
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
      renderCardDescriptionCancelButton(state.savingCardDetail),
    ]),
  ])
}

const renderCardDescriptionCancelButton = (disabled: boolean): Dom.TreeNode => {
  const text = Dom.textNode('Cancel')
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: 'TrelloButton TrelloCardDetailCancelButton',
      disabled,
      name: 'cancelCardDescriptionEdit',
      onClick: 'handleClick',
      onPointerDown: 'handleCardDescriptionCancelPointerDown',
    },
    [text],
  )
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

const renderCardDescriptionHeader = (): Dom.TreeNode => {
  const title = Dom.node(
    VirtualDomElements.H3,
    { className: 'TrelloCardDetailSectionTitle' },
    [Dom.textNode('Description')],
  )
  const editButton = Dom.button(
    'editCardDescription',
    'Edit',
    'TrelloButton TrelloCardDescriptionEditButton',
  )
  return Dom.div('TrelloCardDescriptionHeader', [title, editButton])
}

const renderCardDescription = (
  state: Readonly<TrelloViewState>,
  description: string,
): Dom.TreeNode => {
  return Dom.div('TrelloCardDescriptionSection', [
    renderCardDescriptionHeader(),
    state.editingCardDescription
      ? renderCardDescriptionEditor(state)
      : renderCardDescriptionPreview(description),
  ])
}

export const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly Dom.TreeNode[] => {
  if (state.cardDetailLoading && !state.selectedCardDetail) {
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
    ...renderCardDetailLabels(state, card.labels),
    ...renderCardListSelect(state, card),
    renderCardDescription(state, card.desc || ''),
    renderListTitle('Comments'),
    renderCardDetailComments(state.cardCommentsLoading, comments),
    renderCardCommentComposer(state),
    ...renderCardDetailImages(
      state.cardAttachmentsLoading,
      attachments,
      state.attachmentImageUrls,
      state.failedCardAttachmentImageIds,
    ),
    ...(card.url
      ? [Dom.link('TrelloCardDetailLink', card.url, 'Open in Trello')]
      : []),
  ]
  return [
    Dom.node(VirtualDomElements.Div, {
      className: 'TrelloCardDetailResizeSash',
      name: 'resizeCardDetail',
      onPointerDown: 'handlePointerDown',
    }),
    Dom.node(
      VirtualDomElements.Div,
      {
        className: 'TrelloCardDetailPanel',
        name: 'cardDetail',
        onContextMenu: 'handleContextMenu',
        onPointerMove: 'handlePointerMove',
        onPointerUp: 'handlePointerUp',
        style: `--TrelloCardDetailWidth: ${state.cardDetailWidth}px`,
      },
      children,
    ),
  ]
}
