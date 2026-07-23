import { expect, test } from '@jest/globals'
import type { TrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardMove,
  TrelloCredentials,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../src/parts/TrelloViewState/TrelloViewState.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { moveCardToList } from '../src/parts/MoveCardToList/MoveCardToList.ts'

const credentials: TrelloCredentials = {
  apiKey: 'api-key',
  token: 'token',
}

const card: TrelloCard = {
  id: 'card-1',
  name: 'Plan work',
}

const otherCard: TrelloCard = {
  id: 'card-2',
  idList: 'list-2',
  name: 'Build work',
}

const initialBoardDetail: TrelloBoardDetail = {
  board: {
    id: 'board-1',
    name: 'Roadmap',
  },
  lists: [
    {
      cards: [card],
      id: 'list-1',
      name: 'Todo',
    },
    {
      cards: [otherCard],
      id: 'list-2',
      name: 'Doing',
    },
  ],
}

interface MoveCall {
  readonly card: TrelloCard
  readonly credentials: TrelloCredentials
  readonly move: TrelloCardMove
}

interface TestContext {
  readonly context: TrelloViewActionContext
  readonly getBoardDetailCallCount: () => number
  readonly getMoveCalls: () => readonly MoveCall[]
  readonly getRerenderCount: () => number
  readonly state: TrelloViewState
}

interface TestContextOptions {
  readonly getBoardDetail?: TrelloClient['getBoardDetail']
  readonly moveCard?: TrelloClient['moveCard']
  readonly state?: Readonly<Partial<TrelloViewState>>
}

const createContext = (
  options: Readonly<TestContextOptions> = {},
): TestContext => {
  const state = {
    ...createInitialState(),
    boardDetail: initialBoardDetail,
    credentials,
    ...options.state,
  }
  const moveCalls: MoveCall[] = []
  let getBoardDetailCallCount = 0
  let rerenderCount = 0
  const client = {
    async getBoardDetail(
      board: TrelloBoard,
      currentCredentials: TrelloCredentials,
    ): Promise<TrelloBoardDetail> {
      getBoardDetailCallCount++
      if (options.getBoardDetail) {
        return options.getBoardDetail(board, currentCredentials)
      }
      return state.boardDetail || initialBoardDetail
    },
    async moveCard(
      sourceCard: TrelloCard,
      move: TrelloCardMove,
      currentCredentials: TrelloCredentials,
    ): Promise<TrelloCard> {
      moveCalls.push({
        card: sourceCard,
        credentials: currentCredentials,
        move,
      })
      if (options.moveCard) {
        return options.moveCard(sourceCard, move, currentCredentials)
      }
      return {
        ...sourceCard,
        idList: move.idList,
      }
    },
  } as unknown as TrelloClient
  return {
    context: {
      client,
      requestRerender(): void {
        rerenderCount++
      },
      state,
    } as unknown as TrelloViewActionContext,
    getBoardDetailCallCount(): number {
      return getBoardDetailCallCount
    },
    getMoveCalls(): readonly MoveCall[] {
      return moveCalls
    },
    getRerenderCount(): number {
      return rerenderCount
    },
    state,
  }
}

test('moveCardToList ignores invalid or concurrent moves', async () => {
  const missingCredentials = createContext({
    state: {
      credentials: undefined,
    },
  })
  const missingTarget = createContext()
  const missingCard = createContext()
  const concurrentMove = createContext({
    state: {
      movingCardId: 'card-2',
    },
  })

  await moveCardToList(missingCredentials.context, card.id, 'list-2')
  await moveCardToList(missingTarget.context, card.id, '')
  await moveCardToList(missingCard.context, 'missing-card', 'list-2')
  await moveCardToList(concurrentMove.context, card.id, 'list-2')

  expect(missingCredentials.getMoveCalls()).toEqual([])
  expect(missingTarget.getMoveCalls()).toEqual([])
  expect(missingCard.getMoveCalls()).toEqual([])
  expect(concurrentMove.getMoveCalls()).toEqual([])
})

test('moveCardToList rerenders without moving a card already in the target list', async () => {
  const testContext = createContext()

  await moveCardToList(testContext.context, card.id, 'list-1')

  expect(testContext.getMoveCalls()).toEqual([])
  expect(testContext.getRerenderCount()).toBe(1)
})

test('moveCardToList applies an optimistic move and refreshes matching selected detail', async () => {
  const move = Promise.withResolvers<TrelloCard>()
  const testContext = createContext({
    moveCard: async () => move.promise,
    state: {
      selectedCardDetail: {
        attachments: [],
        card,
        comments: [],
      },
    },
  })

  const result = moveCardToList(testContext.context, card.id, 'list-2', 'top')

  expect(testContext.state.movingCardId).toBe(card.id)
  expect(testContext.state.boardDetail?.lists[0]?.cards).toEqual([])
  expect(testContext.state.boardDetail?.lists[1]?.cards).toEqual([
    {
      ...card,
      idList: 'list-2',
    },
    otherCard,
  ])
  expect(testContext.state.selectedCardDetail?.card.idList).toBe('list-2')
  expect(testContext.getMoveCalls()).toEqual([
    {
      card: {
        ...card,
        idList: 'list-1',
      },
      credentials,
      move: {
        idList: 'list-2',
        pos: 'top',
      },
    },
  ])
  expect(testContext.getRerenderCount()).toBe(1)

  move.resolve({
    ...card,
    idList: 'list-2',
  })
  await result

  expect(testContext.state.movingCardId).toBe('')
  expect(testContext.getBoardDetailCallCount()).toBe(1)
  expect(testContext.getRerenderCount()).toBe(2)
})

test('moveCardToList replaces optimistic state when the refreshed board differs', async () => {
  const freshBoardDetail: TrelloBoardDetail = {
    board: initialBoardDetail.board,
    lists: [
      {
        cards: [],
        id: 'list-1',
        name: 'Todo',
      },
      {
        cards: [
          otherCard,
          {
            ...card,
            idList: 'list-2',
            name: 'Server plan',
          },
        ],
        id: 'list-2',
        name: 'Doing',
      },
    ],
  }
  const testContext = createContext({
    getBoardDetail: async () => freshBoardDetail,
    state: {
      selectedCardDetail: {
        attachments: [],
        card,
        comments: [],
      },
    },
  })

  await moveCardToList(testContext.context, card.id, 'list-2')

  expect(testContext.state.boardDetail).toBe(freshBoardDetail)
  expect(testContext.state.selectedCardDetail?.card).toEqual({
    ...card,
    idList: 'list-2',
    name: 'Server plan',
  })
  expect(testContext.state.movingCardId).toBe('')
  expect(testContext.getRerenderCount()).toBe(2)
})

test('moveCardToList restores previous state when the move fails', async () => {
  const selectedCardDetail = {
    attachments: [],
    card,
    comments: [],
  }
  const testContext = createContext({
    moveCard: async () => {
      throw new Error('Move failed')
    },
    state: {
      selectedCardDetail,
    },
  })
  const previousBoardDetail = testContext.state.boardDetail

  await moveCardToList(testContext.context, card.id, 'list-2')

  expect(testContext.state.boardDetail).toBe(previousBoardDetail)
  expect(testContext.state.selectedCardDetail).toBe(selectedCardDetail)
  expect(testContext.state.error).toBe('Move failed')
  expect(testContext.state.movingCardId).toBe('')
  expect(testContext.getBoardDetailCallCount()).toBe(0)
  expect(testContext.getRerenderCount()).toBe(2)
})

test('moveCardToList reports a board refresh failure', async () => {
  const testContext = createContext({
    getBoardDetail: async () => {
      throw new Error('Refresh failed')
    },
  })

  await moveCardToList(testContext.context, card.id, 'list-2')

  expect(testContext.state.error).toBe('Refresh failed')
  expect(testContext.state.movingCardId).toBe('')
  expect(testContext.getRerenderCount()).toBe(2)
})
