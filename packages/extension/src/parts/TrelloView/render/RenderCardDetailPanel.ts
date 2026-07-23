import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  TrelloAttachment,
  TrelloCard,
  TrelloComment,
  TrelloLabel,
  TrelloList,
} from '../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../MergeClassNames/MergeClassNames.ts'
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
import { renderListTitle } from './RenderListTitle/RenderListTitle.ts'
import { renderMarkdown } from './RenderMarkdown.ts'

interface VirtualDomSegment {
  readonly childCount: number
  readonly dom: readonly VirtualDomNode[]
}

const renderImageAttachment = (
  attachment: Readonly<TrelloAttachment>,
  attachmentImageUrls: Readonly<Record<string, string>>,
  failed: boolean,
): readonly VirtualDomNode[] => {
  const sourceUrl = getAttachmentImageUrl(attachment)
  const imageUrl = attachmentImageUrls[sourceUrl]
  if (failed || !imageUrl) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardDetailImageError',
        type: VirtualDomElements.Div,
      },
      text('Image could not be loaded.'),
    ]
  }
  return [
    {
      alt: attachment.name || 'Card attachment',
      childCount: 0,
      className: 'TrelloCardDetailImage',
      name: attachment.id,
      onError: DomEventListenerFunctions.HandleImageError,
      src: imageUrl,
      type: VirtualDomElements.Img,
    },
  ]
}

const renderCardDetailImages = (
  loading: boolean,
  attachments: readonly TrelloAttachment[],
  attachmentImageUrls: Readonly<Record<string, string>>,
  failedImageIds: readonly string[],
): VirtualDomSegment => {
  if (loading) {
    return {
      childCount: 2,
      dom: [
        ...renderListTitle('Images'),
        {
          childCount: 1,
          className: 'TrelloCardDetailEmpty',
          type: VirtualDomElements.Div,
        },
        text('Loading images...'),
      ],
    }
  }
  const imageAttachments = attachments.filter(isImageAttachment)
  if (imageAttachments.length === 0) {
    return { childCount: 0, dom: [] }
  }
  return {
    childCount: 2,
    dom: [
      ...renderListTitle('Images'),
      {
        childCount: imageAttachments.length,
        className: 'TrelloCardDetailImages',
        type: VirtualDomElements.Div,
      },
      ...imageAttachments.flatMap((attachment) =>
        renderImageAttachment(
          attachment,
          attachmentImageUrls,
          failedImageIds.includes(attachment.id),
        ),
      ),
    ],
  }
}

const renderCardDetailAvatar = (
  comment: Readonly<TrelloComment>,
  author: string,
  avatarUrl: string,
): readonly VirtualDomNode[] => {
  if (avatarUrl) {
    return [
      {
        alt: `${author} avatar`,
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

const renderCardDetailComment = (
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
    ...(dateText
      ? [
          {
            childCount: 1,
            className: 'TrelloCardCommentDate',
            type: VirtualDomElements.Div,
          },
          text(dateText),
        ]
      : []),
    {
      childCount: 1,
      className: 'TrelloCardCommentText',
      type: VirtualDomElements.Div,
    },
    text(commentText),
  ]
}

const renderCardDetailComments = (
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

const renderCardCommentButton = (
  name: string,
  label: string,
  className: string,
  disabled: boolean,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className,
      disabled,
      name,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(label),
  ]
}

const renderCardCommentComposer = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftComment, savingComment, writingComment } = state
  if (!writingComment) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'TrelloButton',
          'TrelloCardCommentWriteButton',
        ),
        name: 'startWriteComment',
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text('Write a comment'),
    ]
  }
  return [
    {
      childCount: 2,
      className: 'TrelloCardCommentComposer',
      type: VirtualDomElements.Div,
    },
    {
      autofocus: true,
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloTextArea',
        'TrelloCardCommentTextArea',
      ),
      disabled: savingComment,
      name: 'cardComment',
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: 'Write a comment...',
      type: VirtualDomElements.TextArea,
      value: draftComment,
    },
    {
      childCount: 2,
      className: 'TrelloCardCommentActions',
      type: VirtualDomElements.Div,
    },
    ...renderCardCommentButton(
      'submitComment',
      savingComment ? 'Saving...' : 'Save',
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentSaveButton',
      ),
      savingComment,
    ),
    ...renderCardCommentButton(
      'cancelWriteComment',
      'Cancel',
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentCancelButton',
      ),
      savingComment,
    ),
  ]
}

const renderCardDetailLabel = (
  label: Readonly<TrelloLabel>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabel',
        'TrelloCardLabelButton',
        getLabelColorClassName(label.color),
      ),
      name: 'openCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(getLabelText(label)),
  ]
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
  const { boardLabels, draftLabelSearchQuery } = state
  const query = draftLabelSearchQuery.trim().toLowerCase()
  return boardLabels.filter((label) => {
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
): readonly VirtualDomNode[] => {
  const { addingCardLabelId } = state
  const checked = hasCardLabel(labels, label.id)
  return [
    {
      childCount: 2,
      className: 'TrelloCardLabelChoice',
      disabled: Boolean(addingCardLabelId),
      name: `addCardLabel:${label.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    {
      checked,
      childCount: 0,
      className: 'TrelloCardLabelChoiceCheckbox',
      inputType: 'checkbox',
      name: `cardLabelCheckbox:${label.id}`,
      tabIndex: -1,
      type: VirtualDomElements.Input,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabelChoiceText',
        getLabelColorClassName(label.color),
      ),
      type: VirtualDomElements.Span,
    },
    text(getLabelText(label)),
  ]
}

const renderCardLabelPickerContent = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { boardLabelsLoading, draftLabelSearchQuery } = state
  if (boardLabelsLoading) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text('Loading labels...'),
    ]
  }
  const matchingLabels = getMatchingLabels(state)
  if (matchingLabels.length === 0) {
    if (draftLabelSearchQuery.trim()) {
      return [
        {
          childCount: 1,
          className: MergeClassNames.mergeClassNames(
            'TrelloButton',
            'TrelloCardLabelCreateButton',
          ),
          name: 'openCardLabelCreate',
          onClick: DomEventListenerFunctions.HandleClick,
          type: VirtualDomElements.Button,
        },
        text('Create a new label'),
      ]
    }
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text('No labels available'),
    ]
  }
  return [
    {
      childCount: matchingLabels.length,
      className: 'TrelloCardLabelPickerList',
      type: VirtualDomElements.Div,
    },
    ...matchingLabels.flatMap((label) =>
      renderCardLabelChoice(state, labels, label),
    ),
  ]
}

const renderCardLabelPickerHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardLabelPickerHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloCardLabelPickerTitle',
      type: VirtualDomElements.Div,
    },
    text('Labels'),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardLabelPickerCloseButton',
      ),
      name: 'closeCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}

const renderCardLabelCreateHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 3,
      className: 'TrelloCardLabelPickerHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardLabelPickerBackButton',
      ),
      name: 'closeCardLabelCreate',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('<'),
    {
      childCount: 1,
      className: 'TrelloCardLabelPickerTitle',
      type: VirtualDomElements.Div,
    },
    text('Create label'),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardLabelPickerCloseButton',
      ),
      name: 'closeCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}

const renderCardLabelColorChoice = (
  state: Readonly<TrelloViewState>,
  color: string,
): VirtualDomNode => {
  const { draftNewLabelColor, savingNewLabel } = state
  const selected = draftNewLabelColor === color
  const colorClassName = getLabelColorClassName(color)
  return {
    'aria-label': `Select ${color.replace('_', ' ')} label color`,
    'aria-pressed': selected,
    childCount: 0,
    className: selected
      ? MergeClassNames.mergeClassNames(
          'TrelloCardLabelColorChoice',
          colorClassName,
          'TrelloCardLabelColorChoiceSelected',
        )
      : MergeClassNames.mergeClassNames(
          'TrelloCardLabelColorChoice',
          colorClassName,
        ),
    disabled: savingNewLabel,
    name: `selectCardLabelColor:${color}`,
    onClick: DomEventListenerFunctions.HandleClick,
    title: color.replace('_', ' '),
    type: VirtualDomElements.Button,
  }
}

const renderCardLabelCreate = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftNewLabelColor, draftNewLabelName, savingNewLabel } = state
  return [
    {
      childCount: 3,
      className: 'TrelloCardLabelCreate',
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelCreateHeader(),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabelCreatePreview',
        getLabelColorClassName(draftNewLabelColor),
      ),
      type: VirtualDomElements.Div,
    },
    text(draftNewLabelName || 'Label title'),
    {
      childCount: 5,
      className: 'TrelloCardLabelCreateFields',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text('Title'),
    {
      autocomplete: 'off',
      childCount: 0,
      className: 'TrelloInput',
      disabled: savingNewLabel,
      name: 'newLabelName',
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'Label title',
      type: VirtualDomElements.Input,
      value: draftNewLabelName,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text('Select a color'),
    {
      childCount: labelColors.length,
      className: 'TrelloCardLabelColorGrid',
      type: VirtualDomElements.Div,
    },
    ...labelColors.map((color) => renderCardLabelColorChoice(state, color)),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloPrimaryButton',
      ),
      disabled: savingNewLabel || !draftNewLabelName.trim(),
      name: 'createCardLabel',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingNewLabel ? 'Creating...' : 'Create'),
  ]
}

const renderCardLabelPicker = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelCreateOpen, draftLabelSearchQuery } = state
  if (cardLabelCreateOpen) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPicker',
        name: 'cardLabelPicker',
        onPointerDown:
          DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
        type: VirtualDomElements.Div,
      },
      ...renderCardLabelCreate(state),
    ]
  }
  return [
    {
      childCount: 3,
      className: 'TrelloCardLabelPicker',
      name: 'cardLabelPicker',
      onPointerDown: DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelPickerHeader(),
    {
      autocomplete: 'off',
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloInput',
        'TrelloCardLabelSearchInput',
      ),
      name: 'cardLabelSearch',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'Search labels',
      type: VirtualDomElements.Input,
      value: draftLabelSearchQuery,
    },
    ...renderCardLabelPickerContent(state, labels),
  ]
}

const renderCardDetailLabels = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  const hasLabels = Boolean(labels && labels.length > 0)
  return [
    {
      childCount: 1 + (cardLabelPickerOpen ? 1 : 0),
      className: 'TrelloCardLabelSection',
      type: VirtualDomElements.Div,
    },
    ...(hasLabels
      ? [
          {
            childCount: 2,
            className: 'TrelloCardLabelRow',
            type: VirtualDomElements.Div,
          },
          {
            childCount: labels!.length,
            className: 'TrelloCardLabels',
            type: VirtualDomElements.Div,
          },
          ...labels!.flatMap(renderCardDetailLabel),
          {
            childCount: 1,
            className: MergeClassNames.mergeClassNames(
              'TrelloButton',
              'TrelloCardLabelAddIconButton',
            ),
            name: 'openCardLabelPicker',
            onClick: DomEventListenerFunctions.HandleClick,
            type: VirtualDomElements.Button,
          },
          text('+'),
        ]
      : [
          {
            childCount: 1,
            className: MergeClassNames.mergeClassNames(
              'TrelloButton',
              'TrelloCardLabelAddButton',
            ),
            name: 'openCardLabelPicker',
            onClick: DomEventListenerFunctions.HandleClick,
            type: VirtualDomElements.Button,
          },
          text('Labels'),
        ]),
    ...(cardLabelPickerOpen ? renderCardLabelPicker(state, labels) : []),
  ]
}

const renderCardDetailTitle = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardTitle, editingCardTitle } = state
  const className = editingCardTitle
    ? MergeClassNames.mergeClassNames(
        'TrelloCardDetailTitleInput',
        'TrelloCardDetailTitleInputEditing',
      )
    : 'TrelloCardDetailTitleInput'
  return [
    {
      childCount: 2,
      className: 'TrelloCardDetailTitleSizer',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className,
      name: 'cardTitle',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onClick: DomEventListenerFunctions.HandleClick,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      rows: 1,
      type: VirtualDomElements.TextArea,
      value: draftCardTitle,
    },
    {
      ariaHidden: true,
      childCount: 1,
      className: 'TrelloCardDetailTitleMirror',
      type: VirtualDomElements.Div,
    },
    text(draftCardTitle || ' '),
  ]
}

const getCardListId = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): string => {
  if (card.idList) {
    return card.idList
  }
  const { boardDetail } = state
  const lists = boardDetail?.lists || []
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
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      selected: list.id === selectedListId,
      type: VirtualDomElements.Option,
      value: list.id,
    },
    text(list.name),
  ]
}

const renderCardListSelect = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): VirtualDomSegment => {
  const { boardDetail, movingCardId } = state
  const lists = boardDetail?.lists || []
  if (lists.length === 0) {
    return { childCount: 0, dom: [] }
  }
  const selectedListId = getCardListId(state, card)
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'TrelloCardListSection',
        type: VirtualDomElements.Div,
      },
      {
        childCount: 1,
        className: 'TrelloCardListLabel',
        type: VirtualDomElements.Label,
      },
      text('List'),
      {
        childCount: lists.length,
        className: MergeClassNames.mergeClassNames(
          'TrelloInput',
          'TrelloCardListSelect',
        ),
        disabled: movingCardId === card.id,
        name: `cardList:${card.id}`,
        onInput: DomEventListenerFunctions.HandleInput,
        type: VirtualDomElements.Select,
        value: selectedListId,
      },
      ...lists.flatMap((list) => renderCardListOption(list, selectedListId)),
    ],
  }
}

const renderCardDescriptionCancelButton = (
  disabled: boolean,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDetailCancelButton',
      ),
      disabled,
      name: 'cancelCardDescriptionEdit',
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown:
        DomEventListenerFunctions.HandleCardDescriptionCancelPointerDown,
      type: VirtualDomElements.Button,
    },
    text('Cancel'),
  ]
}

const renderCardDescriptionEditor = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardDescription, savingCardDetail } = state
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionEditor',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloTextArea',
        'TrelloCardDescriptionTextArea',
      ),
      name: 'cardDescription',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'Add a more detailed description...',
      type: VirtualDomElements.TextArea,
      value: draftCardDescription,
    },
    {
      childCount: 2,
      className: 'TrelloCardDetailActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDetailSaveButton',
      ),
      name: 'saveCardDetail',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingCardDetail ? 'Saving...' : 'Save'),
    ...renderCardDescriptionCancelButton(savingCardDetail),
  ]
}

const renderCardDescriptionPreview = (
  description: string,
): readonly VirtualDomNode[] => {
  const trimmedDescription = description.trim()
  if (!trimmedDescription) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'TrelloCardDescriptionPreview',
          'TrelloCardDescriptionPlaceholder',
        ),
        name: 'editCardDescription',
        onClick: DomEventListenerFunctions.HandleClick,
        role: AriaRoles.None,
        type: VirtualDomElements.Div,
      },
      text('Add a more detailed description...'),
    ]
  }
  const markdown = renderMarkdown(description)
  return [
    {
      childCount: markdown.childCount,
      className: 'TrelloCardDescriptionPreview',
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    ...markdown.dom,
  ]
}

const renderCardDescriptionHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloCardDetailSectionTitle',
      type: VirtualDomElements.H3,
    },
    text('Description'),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDescriptionEditButton',
      ),
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('Edit'),
  ]
}

const renderCardDescription = (
  state: Readonly<TrelloViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  const { editingCardDescription } = state
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionSection',
      type: VirtualDomElements.Div,
    },
    ...renderCardDescriptionHeader(),
    ...(editingCardDescription
      ? renderCardDescriptionEditor(state)
      : renderCardDescriptionPreview(description)),
  ]
}

const renderCardDetailHeader = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardDetailHeader',
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailTitle(state),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDetailCloseButton',
      ),
      name: 'closeCardDetail',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}

const renderCardDetailLink = (url: string): readonly VirtualDomNode[] => {
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

export const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const {
    attachmentImageUrls,
    cardAttachmentsLoading,
    cardCommentsLoading,
    cardDetailLoading,
    failedCardAttachmentImageIds,
    selectedCardDetail,
  } = state
  if (cardDetailLoading && !selectedCardDetail) {
    return [
      {
        childCount: 2,
        className: 'TrelloCardDetailPanel',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle('Card details'),
      text('Loading card...'),
    ]
  }
  if (!selectedCardDetail) {
    return []
  }
  const { attachments, card, comments } = selectedCardDetail
  const listSelect = renderCardListSelect(state, card)
  const images = renderCardDetailImages(
    cardAttachmentsLoading,
    attachments,
    attachmentImageUrls,
    failedCardAttachmentImageIds,
  )
  return [
    {
      childCount: 0,
      className: 'TrelloCardDetailResizeSash',
      name: 'resizeCardDetail',
      onPointerDown: DomEventListenerFunctions.HandleSashPointerDown,
      type: VirtualDomElements.Div,
    },
    {
      childCount:
        6 + listSelect.childCount + images.childCount + (card.url ? 1 : 0),
      className: 'TrelloCardDetailPanel',
      name: 'cardDetail',
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onPointerMove: DomEventListenerFunctions.HandleSashPointerMove,
      onPointerUp: DomEventListenerFunctions.HandleSashPointerUp,
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailHeader(state),
    ...renderCardDetailLabels(state, card.labels),
    ...listSelect.dom,
    ...renderCardDescription(state, card.desc || ''),
    ...renderListTitle('Comments'),
    ...renderCardDetailComments(cardCommentsLoading, comments),
    ...renderCardCommentComposer(state),
    ...images.dom,
    ...(card.url ? renderCardDetailLink(card.url) : []),
  ]
}
