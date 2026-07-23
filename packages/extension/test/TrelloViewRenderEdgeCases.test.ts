import { expect, test } from '@jest/globals'
import type { TrelloCardDetail } from '../src/parts/TrelloTypes/TrelloTypes.ts'
import { renderAuth } from '../src/parts/TrelloView/render/RenderAuth.ts'
import { renderBoards } from '../src/parts/TrelloView/render/RenderBoards.ts'
import { renderCardDetailPanel } from '../src/parts/TrelloView/render/RenderCardDetailPanel.ts'
import { createInitialState } from '../src/parts/TrelloView/state/CreateInitialState.ts'
import { flatten } from '../src/parts/VirtualDom/VirtualDom.ts'

const imageUrl = 'https://example.com/attachment.png'

const cardDetail: TrelloCardDetail = {
  attachments: [
    {
      id: 'attachment-1',
      mimeType: 'image/png',
      url: imageUrl,
    },
  ],
  card: {
    desc: 'Description',
    id: 'card-1',
    name: 'Ship tests',
  },
  comments: [
    {
      data: {
        text: 'Looks good',
      },
      id: 'comment-1',
      memberCreator: {
        avatarUrl: 'https://example.com/avatar.png',
        fullName: 'Test User',
      },
    },
  ],
}

test('card detail rendering covers loading and active editor states', () => {
  const loading = renderCardDetailPanel({
    ...createInitialState(),
    cardDetailLoading: true,
  }).flatMap(flatten)
  expect(loading.some((node) => node.text === 'Loading card...')).toBe(true)

  const active = renderCardDetailPanel({
    ...createInitialState(),
    attachmentImageUrls: {
      [imageUrl]: 'blob:attachment',
    },
    boardLabelsLoading: true,
    cardLabelPickerOpen: true,
    draftCardTitle: '',
    editingCardDescription: true,
    editingCardTitle: true,
    savingCardDetail: true,
    savingComment: true,
    selectedCardDetail: cardDetail,
    writingComment: true,
  }).flatMap(flatten)

  expect(
    active.some((node) => node.className === 'TrelloCardDetailImage'),
  ).toBe(true)
  expect(
    active.some((node) => node.className === 'TrelloCardCommentAvatar'),
  ).toBe(true)
  expect(active.some((node) => node.text === 'Saving...')).toBe(true)
  expect(active.some((node) => node.text === 'Loading labels...')).toBe(true)
})

test('card label rendering covers empty picker and create fallbacks', () => {
  const emptyPicker = renderCardDetailPanel({
    ...createInitialState(),
    cardLabelPickerOpen: true,
    selectedCardDetail: cardDetail,
  }).flatMap(flatten)
  expect(emptyPicker.some((node) => node.text === 'No labels available')).toBe(
    true,
  )

  const createPicker = renderCardDetailPanel({
    ...createInitialState(),
    cardLabelCreateOpen: true,
    cardLabelPickerOpen: true,
    draftNewLabelName: '',
    savingNewLabel: true,
    selectedCardDetail: cardDetail,
  }).flatMap(flatten)
  expect(createPicker.some((node) => node.text === 'Label title')).toBe(true)
  expect(createPicker.some((node) => node.text === 'Creating...')).toBe(true)
})

test('auth and board rendering show their loading labels', () => {
  expect(
    renderAuth({
      ...createInitialState(),
      loading: true,
    }).some((node) => node.text === 'Connecting...'),
  ).toBe(true)
  expect(
    renderBoards({
      ...createInitialState(),
      loading: true,
    }).some((node) => node.text === 'Loading boards...'),
  ).toBe(true)
  expect(
    renderBoards({
      ...createInitialState(),
      activeSearchQuery: 'ship',
      loading: true,
      searchEnabled: true,
    }).some((node) => node.text === 'Searching...'),
  ).toBe(true)
})
