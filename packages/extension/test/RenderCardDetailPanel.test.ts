import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { expect, test } from '@jest/globals'
import type {
  TrelloAttachment,
  TrelloCard,
  TrelloComment,
  TrelloLabel,
  TrelloList,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import { getCardListId } from '../src/parts/TrelloView/render/GetCardListId/GetCardListId.ts'
import { getMatchingLabels } from '../src/parts/TrelloView/render/GetMatchingLabels/GetMatchingLabels.ts'
import { hasCardLabel } from '../src/parts/TrelloView/render/HasCardLabel/HasCardLabel.ts'
import { renderCardCommentButton } from '../src/parts/TrelloView/render/RenderCardCommentButton/RenderCardCommentButton.ts'
import { renderCardCommentComposer } from '../src/parts/TrelloView/render/RenderCardCommentComposer/RenderCardCommentComposer.ts'
import { renderCardDescription } from '../src/parts/TrelloView/render/RenderCardDescription/RenderCardDescription.ts'
import { renderCardDescriptionCancelButton } from '../src/parts/TrelloView/render/RenderCardDescriptionCancelButton/RenderCardDescriptionCancelButton.ts'
import { renderCardDescriptionEditor } from '../src/parts/TrelloView/render/RenderCardDescriptionEditor/RenderCardDescriptionEditor.ts'
import { renderCardDescriptionHeader } from '../src/parts/TrelloView/render/RenderCardDescriptionHeader/RenderCardDescriptionHeader.ts'
import { renderCardDescriptionPreview } from '../src/parts/TrelloView/render/RenderCardDescriptionPreview/RenderCardDescriptionPreview.ts'
import { renderCardDetailAvatar } from '../src/parts/TrelloView/render/RenderCardDetailAvatar/RenderCardDetailAvatar.ts'
import { renderCardDetailComment } from '../src/parts/TrelloView/render/RenderCardDetailComment/RenderCardDetailComment.ts'
import { renderCardDetailComments } from '../src/parts/TrelloView/render/RenderCardDetailComments/RenderCardDetailComments.ts'
import { renderCardDetailHeader } from '../src/parts/TrelloView/render/RenderCardDetailHeader/RenderCardDetailHeader.ts'
import { renderCardDetailImages } from '../src/parts/TrelloView/render/RenderCardDetailImages/RenderCardDetailImages.ts'
import { renderCardDetailLabel } from '../src/parts/TrelloView/render/RenderCardDetailLabel/RenderCardDetailLabel.ts'
import { renderCardDetailLabels } from '../src/parts/TrelloView/render/RenderCardDetailLabels/RenderCardDetailLabels.ts'
import { renderCardDetailLink } from '../src/parts/TrelloView/render/RenderCardDetailLink/RenderCardDetailLink.ts'
import { renderCardDetailPanel } from '../src/parts/TrelloView/render/RenderCardDetailPanel/RenderCardDetailPanel.ts'
import { renderCardDetailTitle } from '../src/parts/TrelloView/render/RenderCardDetailTitle/RenderCardDetailTitle.ts'
import { renderCardLabelChoice } from '../src/parts/TrelloView/render/RenderCardLabelChoice/RenderCardLabelChoice.ts'
import { renderCardLabelColorChoice } from '../src/parts/TrelloView/render/RenderCardLabelColorChoice/RenderCardLabelColorChoice.ts'
import { renderCardLabelCreate } from '../src/parts/TrelloView/render/RenderCardLabelCreate/RenderCardLabelCreate.ts'
import { renderCardLabelCreateHeader } from '../src/parts/TrelloView/render/RenderCardLabelCreateHeader/RenderCardLabelCreateHeader.ts'
import { renderCardLabelPicker } from '../src/parts/TrelloView/render/RenderCardLabelPicker/RenderCardLabelPicker.ts'
import { renderCardLabelPickerContent } from '../src/parts/TrelloView/render/RenderCardLabelPickerContent/RenderCardLabelPickerContent.ts'
import { renderCardLabelPickerHeader } from '../src/parts/TrelloView/render/RenderCardLabelPickerHeader/RenderCardLabelPickerHeader.ts'
import { renderCardListOption } from '../src/parts/TrelloView/render/RenderCardListOption/RenderCardListOption.ts'
import { renderCardListSelect } from '../src/parts/TrelloView/render/RenderCardListSelect/RenderCardListSelect.ts'
import { renderImageAttachment } from '../src/parts/TrelloView/render/RenderImageAttachment/RenderImageAttachment.ts'
import { createInitialState } from '../src/parts/TrelloView/state/CreateInitialState.ts'

const attachmentUrl = 'https://example.com/image.png'

const attachment: TrelloAttachment = {
  id: 'attachment-1',
  mimeType: 'image/png',
  name: 'Screenshot',
  url: attachmentUrl,
}

const comment: TrelloComment = {
  data: {
    text: 'Ready to ship',
  },
  date: '2026-07-23T12:00:00.000Z',
  id: 'comment-1',
  memberCreator: {
    avatarUrl: 'https://example.com/avatar.png',
    fullName: 'Test User',
    initials: 'TU',
  },
}

const label: TrelloLabel = {
  color: 'green',
  id: 'label-1',
  name: 'Done',
}

const card: TrelloCard = {
  desc: 'Card **description**',
  id: 'card-1',
  idList: 'list-1',
  labels: [label],
  name: 'Ship it',
  url: 'https://trello.com/c/card-1',
}

const list: TrelloList = {
  cards: [card],
  id: 'list-1',
  name: 'Doing',
}

const hasText = (dom: readonly VirtualDomNode[], value: string): boolean => {
  return dom.some((node) => node.text === value)
}

const findByName = (
  dom: readonly VirtualDomNode[],
  name: string,
): VirtualDomNode | undefined => {
  return dom.find((node) => node.name === name)
}

test('renderImageAttachment renders loaded and failed images', () => {
  const loaded = renderImageAttachment(
    attachment,
    { [attachmentUrl]: 'blob:image' },
    false,
  )
  expect(loaded[0]).toMatchObject({
    alt: 'Screenshot',
    name: 'attachment-1',
    src: 'blob:image',
  })

  const failed = renderImageAttachment(attachment, {}, true)
  expect(hasText(failed, 'Image could not be loaded.')).toBe(true)
})

test('renderCardDetailImages handles loading, empty, and image states', () => {
  expect(renderCardDetailImages(true, [], {}, []).childCount).toBe(2)
  expect(renderCardDetailImages(false, [], {}, [])).toEqual({
    childCount: 0,
    dom: [],
  })

  const images = renderCardDetailImages(
    false,
    [attachment, { id: 'document-1', mimeType: 'application/pdf' }],
    { [attachmentUrl]: 'blob:image' },
    [],
  )
  expect(images.childCount).toBe(2)
  expect(findByName(images.dom, 'attachment-1')?.src).toBe('blob:image')
})

test('renderCardDetailAvatar renders an image or initials', () => {
  expect(
    renderCardDetailAvatar(comment, 'Test User', 'avatar.png')[0],
  ).toMatchObject({
    alt: 'Test User avatar',
    src: 'avatar.png',
  })

  expect(hasText(renderCardDetailAvatar(comment, 'Test User', ''), 'TU')).toBe(
    true,
  )
})

test('renderCardDetailComment renders author, date, and text', () => {
  const dom = renderCardDetailComment(comment)
  expect(hasText(dom, 'Test User')).toBe(true)
  expect(hasText(dom, 'Ready to ship')).toBe(true)
  expect(dom.some((node) => node.className === 'TrelloCardCommentDate')).toBe(
    true,
  )
})

test('renderCardDetailComments handles loading, empty, and populated states', () => {
  expect(
    hasText(renderCardDetailComments(true, []), 'Loading comments...'),
  ).toBe(true)
  expect(hasText(renderCardDetailComments(false, []), 'No comments')).toBe(true)
  expect(renderCardDetailComments(false, [comment])[0].className).toBe(
    'TrelloCardComments',
  )
})

test('renderCardCommentButton preserves button arguments', () => {
  expect(
    renderCardCommentButton('save', 'Save', 'Button', true)[0],
  ).toMatchObject({
    className: 'Button',
    disabled: true,
    name: 'save',
  })
})

test('renderCardCommentComposer renders collapsed and saving states', () => {
  const initial = createInitialState()
  const collapsed = renderCardCommentComposer(initial)
  expect(hasText(collapsed, 'Write a comment')).toBe(true)

  const saving = renderCardCommentComposer({
    ...initial,
    draftComment: 'New comment',
    savingComment: true,
    writingComment: true,
  })
  expect(findByName(saving, 'cardComment')).toMatchObject({
    disabled: true,
    value: 'New comment',
  })
  expect(hasText(saving, 'Saving...')).toBe(true)
})

test('renderCardDetailLabel renders label text and color', () => {
  const dom = renderCardDetailLabel(label)
  expect(dom[0].className).toContain('TrelloCardLabelColorGreen')
  expect(hasText(dom, 'Done')).toBe(true)
})

test('hasCardLabel finds labels safely', () => {
  expect(hasCardLabel([label], 'label-1')).toBe(true)
  expect(hasCardLabel([label], 'missing')).toBe(false)
  expect(hasCardLabel(undefined, 'label-1')).toBe(false)
})

test('getMatchingLabels filters case-insensitively', () => {
  const state = {
    ...createInitialState(),
    boardLabels: [label, { id: 'label-2', name: 'Blocked' }],
  }
  expect(getMatchingLabels(state)).toHaveLength(2)
  expect(
    getMatchingLabels({
      ...state,
      draftLabelSearchQuery: ' done ',
    }),
  ).toEqual([label])
})

test('renderCardLabelChoice reflects checked and disabled state', () => {
  const dom = renderCardLabelChoice(
    {
      ...createInitialState(),
      addingCardLabelId: 'label-2',
    },
    [label],
    label,
  )
  expect(dom[0].disabled).toBe(true)
  expect(dom[1].checked).toBe(true)
})

test('renderCardLabelPickerContent handles all content states', () => {
  const initial = createInitialState()
  expect(
    hasText(
      renderCardLabelPickerContent(
        { ...initial, boardLabelsLoading: true },
        [],
      ),
      'Loading labels...',
    ),
  ).toBe(true)
  expect(
    hasText(renderCardLabelPickerContent(initial, []), 'No labels available'),
  ).toBe(true)
  expect(
    hasText(
      renderCardLabelPickerContent(
        { ...initial, draftLabelSearchQuery: 'new' },
        [],
      ),
      'Create a new label',
    ),
  ).toBe(true)
  expect(
    renderCardLabelPickerContent({ ...initial, boardLabels: [label] }, [
      label,
    ])[0].className,
  ).toBe('TrelloCardLabelPickerList')
})

test('label picker headers render their controls', () => {
  expect(hasText(renderCardLabelPickerHeader(), 'Labels')).toBe(true)
  expect(
    findByName(renderCardLabelPickerHeader(), 'closeCardLabelPicker'),
  ).toBeDefined()
  expect(hasText(renderCardLabelCreateHeader(), 'Create label')).toBe(true)
  expect(
    findByName(renderCardLabelCreateHeader(), 'closeCardLabelCreate'),
  ).toBeDefined()
})

test('renderCardLabelColorChoice reflects selection and saving', () => {
  const selected = renderCardLabelColorChoice(
    {
      ...createInitialState(),
      draftNewLabelColor: 'green',
      savingNewLabel: true,
    },
    'green',
  )
  expect(selected).toMatchObject({
    'aria-pressed': true,
    disabled: true,
    name: 'selectCardLabelColor:green',
  })

  expect(
    renderCardLabelColorChoice(createInitialState(), 'blue')['aria-pressed'],
  ).toBe(false)
})

test('renderCardLabelCreate renders preview and create state', () => {
  const empty = renderCardLabelCreate(createInitialState())
  expect(hasText(empty, 'Label title')).toBe(true)
  expect(findByName(empty, 'createCardLabel')?.disabled).toBe(true)

  const saving = renderCardLabelCreate({
    ...createInitialState(),
    draftNewLabelName: 'Urgent',
    savingNewLabel: true,
  })
  expect(hasText(saving, 'Urgent')).toBe(true)
  expect(hasText(saving, 'Creating...')).toBe(true)
})

test('renderCardLabelPicker renders picker and create views', () => {
  const picker = renderCardLabelPicker(
    {
      ...createInitialState(),
      boardLabels: [label],
    },
    [label],
  )
  expect(findByName(picker, 'cardLabelSearch')).toBeDefined()

  const create = renderCardLabelPicker(
    {
      ...createInitialState(),
      cardLabelCreateOpen: true,
    },
    [],
  )
  expect(hasText(create, 'Create label')).toBe(true)
})

test('renderCardDetailLabels renders empty, populated, and picker states', () => {
  const initial = createInitialState()
  const empty = renderCardDetailLabels(initial, undefined)
  expect(hasText(empty, 'Labels')).toBe(true)

  const populated = renderCardDetailLabels(initial, [label])
  expect(hasText(populated, 'Done')).toBe(true)
  expect(hasText(populated, '+')).toBe(true)

  const picker = renderCardDetailLabels(
    {
      ...initial,
      cardLabelPickerOpen: true,
    },
    [],
  )
  expect(findByName(picker, 'cardLabelPicker')).toBeDefined()
})

test('renderCardDetailTitle renders placeholder and editing styles', () => {
  const initial = createInitialState()
  expect(hasText(renderCardDetailTitle(initial), ' ')).toBe(true)
  const editing = renderCardDetailTitle({
    ...initial,
    draftCardTitle: 'Updated',
    editingCardTitle: true,
  })
  expect(findByName(editing, 'cardTitle')).toMatchObject({
    className: 'TrelloCardDetailTitleInput TrelloCardDetailTitleInputEditing',
    value: 'Updated',
  })
})

test('getCardListId uses the card value or finds its containing list', () => {
  const initial = createInitialState()
  expect(getCardListId(initial, card)).toBe('list-1')

  const cardWithoutList: TrelloCard = {
    desc: 'Card **description**',
    id: 'card-1',
    labels: [label],
    name: 'Ship it',
    url: 'https://trello.com/c/card-1',
  }
  expect(
    getCardListId(
      {
        ...initial,
        boardDetail: {
          board: { id: 'board-1', name: 'Board' },
          lists: [list],
        },
      },
      cardWithoutList,
    ),
  ).toBe('list-1')
  expect(getCardListId(initial, cardWithoutList)).toBe('')
})

test('renderCardListOption reflects selection', () => {
  expect(renderCardListOption(list, 'list-1')[0].selected).toBe(true)
  expect(renderCardListOption(list, 'other')[0].selected).toBe(false)
})

test('renderCardListSelect handles absent and moving lists', () => {
  expect(renderCardListSelect(createInitialState(), card)).toEqual({
    childCount: 0,
    dom: [],
  })

  const result = renderCardListSelect(
    {
      ...createInitialState(),
      boardDetail: {
        board: { id: 'board-1', name: 'Board' },
        lists: [list],
      },
      movingCardId: 'card-1',
    },
    card,
  )
  expect(result.childCount).toBe(1)
  expect(findByName(result.dom, 'cardList:card-1')).toMatchObject({
    disabled: true,
    value: 'list-1',
  })
})

test('renderCardDescriptionCancelButton reflects disabled state', () => {
  expect(renderCardDescriptionCancelButton(true)[0]).toMatchObject({
    disabled: true,
    name: 'cancelCardDescriptionEdit',
  })
})

test('renderCardDescriptionEditor renders draft and saving state', () => {
  const dom = renderCardDescriptionEditor({
    ...createInitialState(),
    draftCardDescription: 'Draft',
    savingCardDetail: true,
  })
  expect(findByName(dom, 'cardDescription')?.value).toBe('Draft')
  expect(hasText(dom, 'Saving...')).toBe(true)
})

test('renderCardDescriptionPreview handles placeholder and markdown', () => {
  expect(
    hasText(
      renderCardDescriptionPreview(' '),
      'Add a more detailed description...',
    ),
  ).toBe(true)
  expect(hasText(renderCardDescriptionPreview('**Bold**'), 'Bold')).toBe(true)
})

test('renderCardDescriptionHeader renders title and edit action', () => {
  const dom = renderCardDescriptionHeader()
  expect(hasText(dom, 'Description')).toBe(true)
  expect(findByName(dom, 'editCardDescription')).toBeDefined()
})

test('renderCardDescription switches between preview and editor', () => {
  const initial = createInitialState()
  const preview = renderCardDescription(initial, '')
  expect(hasText(preview, 'Add a more detailed description...')).toBe(true)
  const editor = renderCardDescription(
    {
      ...initial,
      editingCardDescription: true,
    },
    '',
  )
  expect(findByName(editor, 'cardDescription')).toBeDefined()
})

test('renderCardDetailHeader renders title and close action', () => {
  const dom = renderCardDetailHeader({
    ...createInitialState(),
    draftCardTitle: 'Card title',
  })
  expect(hasText(dom, 'Card title')).toBe(true)
  expect(findByName(dom, 'closeCardDetail')).toBeDefined()
})

test('renderCardDetailLink renders an external Trello link', () => {
  expect(renderCardDetailLink('https://trello.com/c/card-1')[0]).toMatchObject({
    href: 'https://trello.com/c/card-1',
    target: '_blank',
  })
})

test('renderCardDetailPanel handles loading, absent, and complete details', () => {
  const initial = createInitialState()
  const loading = renderCardDetailPanel({
    ...initial,
    cardDetailLoading: true,
  })
  expect(hasText(loading, 'Loading card...')).toBe(true)
  expect(renderCardDetailPanel(initial)).toEqual([])

  const dom = renderCardDetailPanel({
    ...initial,
    attachmentImageUrls: {
      [attachmentUrl]: 'blob:image',
    },
    boardDetail: {
      board: { id: 'board-1', name: 'Board' },
      lists: [list],
    },
    draftCardTitle: card.name,
    selectedCardDetail: {
      attachments: [attachment],
      card,
      comments: [comment],
    },
  })
  expect(findByName(dom, 'cardDetail')).toBeDefined()
  expect(findByName(dom, 'cardList:card-1')).toBeDefined()
  expect(hasText(dom, 'Open in Trello')).toBe(true)
})
