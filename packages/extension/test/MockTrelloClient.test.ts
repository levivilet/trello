import { expect, test } from '@jest/globals'
import type { TrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloCard,
  TrelloCardDetail,
  TrelloCredentials,
  TrelloLabel,
  TrelloList,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import {
  createMockTrelloClient,
  type MockTrelloData,
} from '../src/parts/MockTrelloClient/MockTrelloClient.ts'

const credentials: TrelloCredentials = {
  apiKey: 'abcdefghijklmnopqrstuvwxyz123456',
  token: 'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456',
}

const board: TrelloBoard = {
  id: 'board-1',
  name: 'Roadmap',
}

const card: TrelloCard = {
  id: 'card-1',
  idList: 'list-1',
  name: 'Ship tests',
}

const label: TrelloLabel = {
  color: 'blue',
  id: 'label-1',
  idBoard: board.id,
  name: 'Testing',
}

const list: TrelloList = {
  cards: [card],
  id: 'list-1',
  name: 'Todo',
}

const createClient = (
  overrides: Readonly<MockTrelloData> = {},
): TrelloClient => {
  return createMockTrelloClient({
    boardDetails: {
      [board.id]: {
        board,
        lists: [list],
      },
    },
    boards: [board],
    cardDetails: {
      [card.id]: {
        attachments: [],
        card,
        comments: [],
      },
    },
    ...overrides,
  })
}

test('mock client reports its shared error from every operation', async () => {
  const client = createMockTrelloClient({
    error: 'Trello unavailable',
  })
  const calls = [
    client.addCardComment(card, 'Hello', credentials),
    client.addCardLabel(card, label, credentials),
    client.createCard(list, { name: 'New card', pos: 'bottom' }, credentials),
    client.createLabel(
      board,
      { color: 'green', name: 'New label' },
      credentials,
    ),
    client.createList(board, { name: 'New list', pos: 'bottom' }, credentials),
    client.getBoardDetail(board, credentials),
    client.getCardDetail(card, credentials),
    client.listBoardLabels(board, credentials),
    client.listBoards(credentials),
    client.moveCard(card, { idList: 'list-2', pos: 'bottom' }, credentials),
    client.search('card', credentials),
    client.updateCard(card, { desc: '', name: 'Updated card' }, credentials),
    client.updateList(list, { name: 'Updated list' }, credentials),
  ]

  for (const call of calls) {
    await expect(call).rejects.toThrow('Trello unavailable')
  }
})

test('mock client reports operation-specific errors', async () => {
  const client = createClient({
    boardDetailErrors: { [board.id]: 'Board failed' },
    cardCommentAddErrors: { [card.id]: 'Comment failed' },
    cardCreateErrors: { [list.id]: 'Card failed' },
    cardDetailErrors: { [card.id]: 'Detail failed' },
    cardLabelAddErrors: { [card.id]: 'Label failed' },
    cardMoveErrors: { [card.id]: 'Move failed' },
    cardUpdateErrors: { [card.id]: 'Update failed' },
    listBoardsError: 'Boards failed',
    listCreateErrors: { [board.id]: 'List failed' },
    listUpdateErrors: { [list.id]: 'List update failed' },
    searchError: 'Search failed',
  })

  await expect(
    client.addCardComment(card, 'Hello', credentials),
  ).rejects.toThrow('Comment failed')
  await expect(client.addCardLabel(card, label, credentials)).rejects.toThrow(
    'Label failed',
  )
  await expect(
    client.createCard(list, { name: 'New card', pos: 'bottom' }, credentials),
  ).rejects.toThrow('Card failed')
  await expect(
    client.createList(board, { name: 'New list', pos: 'bottom' }, credentials),
  ).rejects.toThrow('List failed')
  await expect(client.getBoardDetail(board, credentials)).rejects.toThrow(
    'Board failed',
  )
  await expect(client.getCardDetail(card, credentials)).rejects.toThrow(
    'Detail failed',
  )
  await expect(client.listBoards(credentials)).rejects.toThrow('Boards failed')
  await expect(
    client.moveCard(card, { idList: 'list-2', pos: 'bottom' }, credentials),
  ).rejects.toThrow('Move failed')
  await expect(client.search('card', credentials)).rejects.toThrow(
    'Search failed',
  )
  await expect(
    client.updateCard(card, { desc: '', name: 'Updated card' }, credentials),
  ).rejects.toThrow('Update failed')
  await expect(
    client.updateList(list, { name: 'Updated list' }, credentials),
  ).rejects.toThrow('List update failed')
})

test('mock client supports empty data and cache-first fallbacks', async () => {
  const client = createMockTrelloClient({})
  const externalCard: TrelloCard = {
    id: 'external-card',
    name: 'External card',
  }

  await expect(client.listBoards(credentials)).resolves.toEqual([])
  await expect(client.listBoardLabels(board, credentials)).resolves.toEqual([])
  await expect(client.search('missing', credentials)).resolves.toEqual([])
  await expect(client.getBoardDetail(board, credentials)).resolves.toEqual({
    board,
    lists: [],
  })
  await expect(
    client.getCardDetail(externalCard, credentials),
  ).resolves.toEqual({
    attachments: [],
    card: externalCard,
    comments: [],
  })
  const boardResult = await client.getBoardDetailCacheFirst(board, credentials)
  await expect(boardResult.fresh).resolves.toEqual({
    board,
    lists: [],
  })
  const cardResult = await client.getCardDetailCacheFirst(
    externalCard,
    credentials,
  )
  await expect(cardResult.fresh).resolves.toEqual({
    attachments: [],
    card: externalCard,
    comments: [],
  })
  const parts = await client.getCardDetailPartsCacheFirst(
    externalCard,
    credentials,
  )
  await expect(parts.fresh.attachments).resolves.toEqual([])
  await expect(parts.fresh.card).resolves.toEqual(externalCard)
  await expect(parts.fresh.comments).resolves.toEqual([])
  const boardsResult = await client.listBoardsCacheFirst(credentials)
  await expect(boardsResult.fresh).resolves.toEqual([])
  const searchResult = await client.searchCacheFirst('missing', credentials)
  await expect(searchResult.fresh).resolves.toEqual([])
})

test('mock client uses scripted board responses before its fallback boards', async () => {
  const scriptedBoard = {
    id: 'board-scripted',
    name: 'Scripted',
  }
  const client = createMockTrelloClient({
    boards: [board],
    listBoardsResponses: [[scriptedBoard]],
  })

  await expect(client.listBoards(credentials)).resolves.toEqual([scriptedBoard])
  await expect(client.listBoards(credentials)).resolves.toEqual([board])
})

test('mock client creates records when their parent data is absent', async () => {
  const client = createMockTrelloClient({
    boardDetails: {
      unrelated: {
        board: {
          id: 'unrelated',
          name: 'Unrelated',
        },
        lists: [],
      },
    },
  })

  await expect(
    client.addCardComment(card, 'Hello', credentials),
  ).resolves.toMatchObject({
    data: {
      text: 'Hello',
    },
  })
  await expect(
    client.createCard(list, { name: 'New card', pos: 'bottom' }, credentials),
  ).resolves.toMatchObject({
    idList: list.id,
    name: 'New card',
  })
  await expect(
    client.createLabel(board, { color: 'red', name: 'Bug' }, credentials),
  ).resolves.toMatchObject({
    color: 'red',
    name: 'Bug',
  })
  await expect(
    client.createList(board, { name: 'New list', pos: 'bottom' }, credentials),
  ).resolves.toMatchObject({
    cards: [],
    name: 'New list',
  })
})

test('mock client adds a label once and updates matching board cards', async () => {
  const client = createMockTrelloClient({
    boardDetails: {
      [board.id]: {
        board,
        lists: [
          list,
          {
            cards: [
              {
                id: 'card-2',
                name: 'Other card',
              },
            ],
            id: 'list-2',
            name: 'Done',
          },
        ],
      },
    },
  })

  await expect(client.addCardLabel(card, label, credentials)).resolves.toEqual({
    ...card,
    labels: [label],
  })
  await expect(client.addCardLabel(card, label, credentials)).resolves.toEqual({
    ...card,
    labels: [label],
  })
  await expect(client.getCardDetail(card, credentials)).resolves.toMatchObject({
    attachments: [],
    card: {
      labels: [label],
    },
    comments: [],
  })
  await expect(
    client.getBoardDetail(board, credentials),
  ).resolves.toMatchObject({
    lists: [
      {
        cards: [
          {
            labels: [label],
          },
        ],
      },
      {
        cards: [
          {
            id: 'card-2',
          },
        ],
      },
    ],
  })
})

test('mock client preserves card details while moving and updating cards', async () => {
  const detailWithoutCollections = {
    card,
  } as unknown as TrelloCardDetail
  const client = createMockTrelloClient({
    boardDetails: {
      [board.id]: {
        board,
        lists: [
          list,
          {
            cards: [],
            id: 'list-2',
            name: 'Done',
          },
        ],
      },
    },
    cardDetails: {
      [card.id]: detailWithoutCollections,
    },
  })

  await expect(
    client.updateCard(card, { desc: 'Covered', name: 'Updated' }, credentials),
  ).resolves.toMatchObject({
    desc: 'Covered',
    name: 'Updated',
  })
  await expect(
    client.moveCard(card, { idList: 'list-2', pos: 'top' }, credentials),
  ).resolves.toMatchObject({
    idList: 'list-2',
  })
  await expect(
    client.getBoardDetail(board, credentials),
  ).resolves.toMatchObject({
    lists: [
      {
        cards: [],
      },
      {
        cards: [
          {
            id: card.id,
          },
        ],
      },
    ],
  })
})

test('mock client leaves unrelated cards and lists unchanged', async () => {
  const client = createClient()
  const externalCard = {
    id: 'external-card',
    name: 'External card',
  }
  const externalList = {
    cards: [],
    id: 'external-list',
    name: 'External list',
  }

  await expect(
    client.moveCard(
      externalCard,
      { idList: 'missing-list', pos: 'bottom' },
      credentials,
    ),
  ).resolves.toMatchObject({
    id: externalCard.id,
    idList: 'missing-list',
  })
  await expect(
    client.updateCard(
      externalCard,
      { desc: 'External description', name: 'Updated external card' },
      credentials,
    ),
  ).resolves.toMatchObject({
    desc: 'External description',
    name: 'Updated external card',
  })
  await expect(
    client.updateList(
      externalList,
      { name: 'Updated external list' },
      credentials,
    ),
  ).resolves.toMatchObject({
    name: 'Updated external list',
  })
  await expect(
    client.getBoardDetail(board, credentials),
  ).resolves.toMatchObject({
    lists: [
      {
        id: list.id,
        name: list.name,
      },
    ],
  })
})
