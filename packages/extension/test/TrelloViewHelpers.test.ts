import { expect, test } from '@jest/globals'
import {
  getAttachmentImageUrl,
  isImageAttachment,
} from '../src/parts/TrelloView/AttachmentHelpers.ts'
import {
  getRecentlyViewedBoards,
  getWorkspaceSections,
} from '../src/parts/TrelloView/BoardSections.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../src/parts/TrelloView/LabelHelpers.ts'
import { createInitialState } from '../src/parts/TrelloView/state/CreateInitialState.ts'
import { validateCredentials } from '../src/parts/TrelloView/ValidateCredentials.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'

test('validateCredentials returns the expected validation messages', () => {
  expect(validateCredentials({ apiKey: '', token: '' })).toBe(
    'Enter an API key and token.',
  )
  expect(validateCredentials({ apiKey: 'bad-key', token: validToken })).toBe(
    'API key must be 32 alphanumeric characters.',
  )
  expect(validateCredentials({ apiKey: validApiKey, token: 'bad-token' })).toBe(
    'Token must be 64 alphanumeric characters.',
  )
  expect(validateCredentials({ apiKey: validApiKey, token: validToken })).toBe(
    '',
  )
})

test('getRecentlyViewedBoards sorts by trello and local viewed dates', () => {
  const state = {
    ...createInitialState(),
    boards: [
      {
        dateLastView: '2026-01-01T00:00:00.000Z',
        id: 'board-1',
        name: 'Trello older',
      },
      {
        id: 'board-2',
        name: 'Local newer',
      },
      {
        dateLastView: 'invalid',
        id: 'board-3',
        name: 'Never viewed',
      },
    ],
    recentBoardViews: [
      {
        boardId: 'board-2',
        viewedAt: '2026-01-03T00:00:00.000Z',
      },
    ],
  }

  expect(getRecentlyViewedBoards(state).map((board) => board.name)).toEqual([
    'Local newer',
    'Trello older',
  ])
})

test('getWorkspaceSections groups boards by workspace with personal fallback', () => {
  const state = {
    ...createInitialState(),
    boards: [
      {
        id: 'board-1',
        name: 'Team board',
        organization: {
          displayName: 'Product',
          id: 'org-1',
          name: 'product',
        },
      },
      {
        id: 'board-2',
        name: 'Personal board',
      },
    ],
  }

  expect(
    getWorkspaceSections(state).map((section) => {
      return {
        boards: section.boards.map((board) => board.name),
        name: section.name,
      }
    }),
  ).toEqual([
    {
      boards: ['Team board'],
      name: 'Product',
    },
    {
      boards: ['Personal board'],
      name: 'Personal boards',
    },
  ])
})

test('attachment helpers detect image attachments and choose fallback urls', () => {
  expect(
    isImageAttachment({
      id: 'attachment-1',
      mimeType: 'image/png',
      url: 'https://example.com/file',
    }),
  ).toBe(true)
  expect(
    isImageAttachment({
      id: 'attachment-2',
      url: 'https://example.com/file.webp?download=1',
    }),
  ).toBe(true)
  expect(
    isImageAttachment({
      id: 'attachment-3',
      previews: [{ url: 'https://example.com/preview-small.png' }],
      url: 'https://example.com/file',
    }),
  ).toBe(true)
  expect(
    isImageAttachment({
      id: 'attachment-4',
      mimeType: 'application/pdf',
      url: 'https://example.com/file.pdf',
    }),
  ).toBe(false)

  expect(
    getAttachmentImageUrl({
      id: 'attachment-5',
      previews: [
        { url: 'https://example.com/preview-small.png' },
        { url: 'https://example.com/preview-large.png' },
      ],
      url: 'https://example.com/file',
    }),
  ).toBe('https://example.com/preview-large.png')
})

test('label helpers prefer label names and known color classes', () => {
  expect(
    getLabelText({
      color: 'blue',
      id: 'label-1',
      name: '  Engineering  ',
    }),
  ).toBe('Engineering')
  expect(
    getLabelText({
      color: 'green',
      id: 'label-2',
    }),
  ).toBe('green')
  expect(
    getLabelText({
      id: 'label-3',
    }),
  ).toBe('Label')
  expect(getLabelColorClassName('blue')).toBe('TrelloCardLabelColorBlue')
  expect(getLabelColorClassName('unknown')).toBe('TrelloCardLabelColorNeutral')
})
