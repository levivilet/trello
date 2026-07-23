import { expect, test } from '@jest/globals'
import {
  getAttachmentImageUrl,
  isImageAttachment,
} from '../src/parts/TrelloView/AttachmentHelpers.ts'
import {
  getRecentlyViewedBoards,
  getWorkspaceSections,
  sortBoardsByViewedAt,
} from '../src/parts/TrelloView/BoardSections.ts'
import { getCardCoverImageUrl } from '../src/parts/TrelloView/CardCoverHelpers.ts'
import {
  getCommentAuthor,
  getCommentAvatarUrl,
  getCommentDateText,
  getCommentInitials,
  getCommentText,
} from '../src/parts/TrelloView/CommentHelpers.ts'
import { getErrorMessage } from '../src/parts/TrelloView/GetErrorMessage.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../src/parts/TrelloView/LabelHelpers.ts'
import {
  getMenuEntries,
  MenuIdCard,
  MenuIdList,
} from '../src/parts/TrelloView/MenuEntries.ts'
import { renderMarkdown } from '../src/parts/TrelloView/render/RenderMarkdown.ts'
import { getAssetBaseUrl } from '../src/parts/TrelloView/state/AssetBaseUrl.ts'
import { createInitialState } from '../src/parts/TrelloView/state/CreateInitialState.ts'
import { validateCredentials } from '../src/parts/TrelloView/ValidateCredentials.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'
const validLongToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijkl'

test('validateCredentials returns the expected validation messages', () => {
  expect(validateCredentials({ apiKey: '', token: '' })).toBe(
    'Enter an API key and token.',
  )
  expect(
    validateCredentials({ apiKey: validApiKey, token: ' '.repeat(3) }),
  ).toBe('Enter an API key and token.')
  expect(validateCredentials({ apiKey: 'bad-key', token: validToken })).toBe(
    'API key must be 32 alphanumeric characters.',
  )
  expect(validateCredentials({ apiKey: validApiKey, token: validToken })).toBe(
    '',
  )
  expect(
    validateCredentials({ apiKey: validApiKey, token: validLongToken }),
  ).toBe('')
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

test('sortBoardsByViewedAt preserves order for boards outside the loaded list', () => {
  const state = createInitialState()
  const boards = [
    {
      id: 'external-1',
      name: 'First',
    },
    {
      id: 'external-2',
      name: 'Second',
    },
  ]

  expect(sortBoardsByViewedAt(state, boards)).toEqual(boards)
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
  expect(
    getAttachmentImageUrl({
      id: 'attachment-6',
      mimeType: 'image/png',
      url: 'https://example.com/download',
    }),
  ).toBe('https://example.com/download')
  expect(
    getAttachmentImageUrl({
      id: 'attachment-7',
      url: 'https://example.com/download',
    }),
  ).toBe('https://example.com/download')
  expect(
    getAttachmentImageUrl({
      id: 'attachment-8',
    }),
  ).toBe('')
})

test('card cover helper chooses image urls with fallbacks', () => {
  expect(
    getCardCoverImageUrl({
      cover: {
        scaled: [
          { url: 'https://example.com/cover-small.png' },
          { url: 'https://example.com/cover-large.png' },
        ],
      },
      id: 'card-1',
      name: 'Covered card',
    }),
  ).toBe('https://example.com/cover-large.png')
  expect(
    getCardCoverImageUrl({
      cover: {
        sharedSourceUrl: 'https://example.com/shared-cover.png',
      },
      id: 'card-2',
      name: 'Shared cover card',
    }),
  ).toBe('https://example.com/shared-cover.png')
  expect(
    getCardCoverImageUrl({
      cover: {
        color: 'green',
      },
      id: 'card-3',
      name: 'Color cover card',
    }),
  ).toBe('')
  expect(
    getCardCoverImageUrl({
      cover: {
        url: 'https://example.com/direct-cover.png',
      },
      id: 'card-4',
      name: 'Direct cover card',
    }),
  ).toBe('https://example.com/direct-cover.png')
})

test('comment helpers handle single names and missing text', () => {
  expect(
    getCommentInitials({
      data: {},
      id: 'comment-single-name',
      memberCreator: {
        fullName: 'simon',
      },
    }),
  ).toBe('SI')
  expect(
    getCommentText({
      data: {},
      id: 'comment-without-text',
    }),
  ).toBe('No comment text')
})

test('error, menu, asset, and virtual dom helpers handle fallbacks', () => {
  expect(getErrorMessage(new Error('Expected error'))).toBe('Expected error')

  const state = createInitialState()
  expect(getMenuEntries(state, MenuIdCard)).toEqual([
    {
      command: 'trello.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'trello.backToBoards',
      id: 'backToBoards',
      label: 'Back to Boards',
    },
  ])
  expect(getMenuEntries(state, MenuIdList)).toEqual([
    {
      command: 'trello.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'trello.backToBoards',
      id: 'backToBoards',
      label: 'Back to Boards',
    },
  ])
  expect(getMenuEntries(state, 'unknown')).toEqual([])

  expect(getAssetBaseUrl('https://example.com/extension/trelloMain.js')).toBe(
    'https://example.com/',
  )
  expect(
    getAssetBaseUrl(
      'file:///workspace/src/parts/TrelloView/state/AssetBaseUrl.ts',
    ),
  ).toBe('/remote/workspace/')
})

test('markdown rendering treats incomplete and unsafe markup as text', () => {
  const markdown = [
    '**unclosed',
    '',
    '`unclosed',
    '',
    '*unclosed',
    '',
    '[unclosed',
    '',
    '[label] without target',
    '',
    '[label](unclosed',
    '',
    '[](https://example.com) [label]() [label](has space)',
    '',
    '[unsafe](javascript:alert)',
    '',
    'first line',
    'second line',
    '# heading',
    'paragraph before list',
    '- list item',
  ].join('\n')

  expect(renderMarkdown(markdown).childCount).toBeGreaterThan(0)
})

test('comment helpers use trello member metadata with fallbacks', () => {
  expect(
    getCommentAuthor({
      data: { text: 'Hello' },
      id: 'comment-1',
      memberCreator: {
        fullName: '  Test User  ',
        username: 'testuser',
      },
    }),
  ).toBe('Test User')
  expect(
    getCommentAuthor({
      data: { text: 'Hello' },
      id: 'comment-2',
      memberCreator: {
        username: 'testuser',
      },
    }),
  ).toBe('testuser')
  expect(
    getCommentInitials({
      data: { text: 'Hello' },
      id: 'comment-3',
      memberCreator: {
        fullName: 'Test User',
      },
    }),
  ).toBe('TU')
  expect(
    getCommentInitials({
      data: { text: 'Hello' },
      id: 'comment-4',
      memberCreator: {
        initials: 'TS',
      },
    }),
  ).toBe('TS')
  expect(
    getCommentInitials({
      data: { text: 'Hello' },
      id: 'comment-5',
    }),
  ).toBe('?')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-6',
      memberCreator: {
        avatarUrl: ' https://example.com/avatar.png ',
      },
    }),
  ).toBe('https://example.com/avatar.png')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-7',
      memberCreator: {
        avatarUrl: 'https://trello-members.s3.amazonaws.com/member/hash',
      },
    }),
  ).toBe('https://trello-members.s3.amazonaws.com/member/hash/50.png')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-8',
      memberCreator: {
        avatarUrl: 'https://trello-members.s3.amazonaws.com/member/hash/',
      },
    }),
  ).toBe('https://trello-members.s3.amazonaws.com/member/hash/50.png')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-9',
      memberCreator: {
        avatarUrl: 'https://trello-avatars.s3.amazonaws.com/hash/30.png',
      },
    }),
  ).toBe('https://trello-avatars.s3.amazonaws.com/hash/30.png')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-10',
      memberCreator: {
        avatarUrl: ' '.repeat(3),
      },
    }),
  ).toBe('')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-11',
    }),
  ).toBe('')
  expect(
    getCommentAvatarUrl({
      data: { text: 'Hello' },
      id: 'comment-12',
      memberCreator: {
        avatarUrl: 'https://example.com/avatar',
      },
    }),
  ).toBe('https://example.com/avatar')
})

test('comment date helper formats valid dates and omits missing dates', () => {
  expect(
    getCommentDateText({
      data: { text: 'Hello' },
      date: '2026-07-03T10:11:00.000Z',
      id: 'comment-1',
    }),
  ).toBe('Jul 3, 2026, 12:11 PM')
  expect(
    getCommentDateText({
      data: { text: 'Hello' },
      date: 'invalid',
      id: 'comment-2',
    }),
  ).toBe('')
  expect(
    getCommentDateText({
      data: { text: 'Hello' },
      id: 'comment-3',
    }),
  ).toBe('')
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
  expect(getLabelColorClassName('green_dark')).toBe(
    'TrelloCardLabelColorGreenDark',
  )
  expect(getLabelColorClassName('yellow_light')).toBe(
    'TrelloCardLabelColorYellowLight',
  )
  expect(getLabelColorClassName('unknown')).toBe('TrelloCardLabelColorNeutral')
})
