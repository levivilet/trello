import type { ViewEvent } from '@lvce-editor/api'
import { expect, test } from '@jest/globals'
import type { TrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCredentials,
  TrelloList,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../src/parts/TrelloView/state/TrelloViewState.ts'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMemoryCurrentBoardStorage } from '../src/parts/CurrentBoardStorage/CurrentBoardStorage.ts'
import { createMockTrelloClient } from '../src/parts/MockTrelloClient/MockTrelloClient.ts'
import { createMemoryRecentBoardStorage } from '../src/parts/RecentBoardStorage/RecentBoardStorage.ts'
import { submitAddCard } from '../src/parts/TrelloView/actions/AddCard.ts'
import {
  addCardLabel,
  closeCardLabelPicker,
  openCardLabelPicker,
} from '../src/parts/TrelloView/actions/AddCardLabel.ts'
import {
  startWriteComment,
  submitComment,
} from '../src/parts/TrelloView/actions/AddComment.ts'
import { submitAddList } from '../src/parts/TrelloView/actions/AddList.ts'
import { cancelCardDescriptionEdit } from '../src/parts/TrelloView/actions/CancelCardDescriptionEdit.ts'
import {
  createCardLabel,
  openCardLabelCreate,
} from '../src/parts/TrelloView/actions/CreateCardLabel.ts'
import { findBoardCard } from '../src/parts/TrelloView/actions/FindBoardCard.ts'
import {
  handleDragLeaveEvent,
  handleDragOverEvent,
  handleDragStartEvent,
  handleDropEvent,
} from '../src/parts/TrelloView/actions/HandleDragEvent.ts'
import { handleFocusEvent } from '../src/parts/TrelloView/actions/HandleFocusEvent.ts'
import { handleImageErrorEvent } from '../src/parts/TrelloView/actions/HandleImageErrorEvent.ts'
import { handleInputEvent } from '../src/parts/TrelloView/actions/HandleInputEvent.ts'
import { handleKeyDownEvent } from '../src/parts/TrelloView/actions/HandleKeyDownEvent.ts'
import { loadBoards } from '../src/parts/TrelloView/actions/LoadBoards.ts'
import {
  resizeCardDetail,
  startResizeCardDetail,
  stopResizeCardDetail,
} from '../src/parts/TrelloView/actions/ResizeCardDetail.ts'
import { restoreCurrentBoard } from '../src/parts/TrelloView/actions/RestoreCurrentBoard.ts'
import { updateBoardDetailCard } from '../src/parts/TrelloView/actions/UpdateBoardDetailCard.ts'
import { updateBoardDetailList } from '../src/parts/TrelloView/actions/UpdateBoardDetailList.ts'
import { createInitialState } from '../src/parts/TrelloView/state/CreateInitialState.ts'

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

const list: TrelloList = {
  cards: [card],
  id: 'list-1',
  name: 'Todo',
}

const boardDetail: TrelloBoardDetail = {
  board,
  lists: [list],
}

interface TestContext {
  readonly context: TrelloViewActionContext
  readonly getRerenderCount: () => number
  readonly state: TrelloViewState
}

const createContext = (
  overrides: Readonly<Partial<TrelloViewState>> = {},
  client: TrelloClient = createMockTrelloClient({
    boardDetails: {
      [board.id]: boardDetail,
    },
    boards: [board],
    cardDetails: {
      [card.id]: {
        attachments: [],
        card,
        comments: [],
      },
    },
  }),
): TestContext => {
  const state = {
    ...createInitialState(),
    ...overrides,
  }
  let rerenderCount = 0
  return {
    context: {
      client,
      currentBoardStorage: createMemoryCurrentBoardStorage(),
      imageCache: {
        dispose(): void {},
        async resolveImageUrl(): Promise<string> {
          return ''
        },
      },
      recentStorage: createMemoryRecentBoardStorage(),
      requestRerender(): void {
        rerenderCount++
      },
      async showContextMenu(): Promise<void> {},
      state,
      storage: createMemoryCredentialStorage(),
    },
    getRerenderCount(): number {
      return rerenderCount
    },
    state,
  }
}

test('add card guards invalid forms, missing state, and missing lists', async () => {
  const missingState = createContext()
  await submitAddCard(missingState.context, undefined)
  await submitAddCard(missingState.context, 'addCard:list-1')

  const missingList = createContext({
    boardDetail,
    credentials,
  })
  await submitAddCard(missingList.context, 'addCard:missing')

  expect(missingState.getRerenderCount()).toBe(0)
  expect(missingList.getRerenderCount()).toBe(0)
})

test('comment and list actions validate state and empty values', async () => {
  const context = createContext()
  startWriteComment(context.context)
  await submitComment(context.context)
  await expect(submitAddList(context.context, 'other-form')).resolves.toBe(
    false,
  )
  await expect(submitAddList(context.context, 'addList')).resolves.toBe(true)

  const authenticated = createContext({
    boardDetail,
    credentials,
    draftComment: ' '.repeat(3),
    draftNewListTitle: ' '.repeat(3),
    selectedCardDetail: {
      attachments: [],
      card,
      comments: [],
    },
  })
  await submitComment(authenticated.context)
  expect(authenticated.state.error).toBe('Comment is required.')
  await submitAddList(authenticated.context, 'addList')
  expect(authenticated.state.error).toBe('List title is required.')
})

test('label creation validates searches, state, and empty titles', async () => {
  const missingState = createContext()
  openCardLabelCreate(missingState.context)
  await createCardLabel(missingState.context)
  expect(missingState.getRerenderCount()).toBe(0)

  const emptyTitle = createContext({
    boardDetail,
    credentials,
    draftNewLabelColor: 'green',
    draftNewLabelName: ' '.repeat(3),
    selectedCardDetail: {
      attachments: [],
      card,
      comments: [],
    },
  })
  await createCardLabel(emptyTitle.context)
  expect(emptyTitle.state.error).toBe('Label title is required.')
})

test('card label actions handle missing state, duplicate labels, and API fallbacks', async () => {
  const missingState = createContext()
  await openCardLabelPicker(missingState.context)
  await addCardLabel(missingState.context, 'missing')

  const label = {
    color: 'blue',
    id: 'label-1',
    idBoard: board.id,
    name: 'Testing',
  }
  const selectedCardDetail = {
    attachments: [],
    card,
    comments: [],
  }
  const authenticated = createContext({
    boardDetail,
    boardLabels: [label],
    credentials,
    focusedName: 'newLabelName',
    selectedCardDetail,
  })
  closeCardLabelPicker(authenticated.context)
  await addCardLabel(authenticated.context, 'missing')

  authenticated.state.selectedCardDetail = {
    ...selectedCardDetail,
    card: {
      ...card,
      labels: [label],
    },
  }
  await addCardLabel(authenticated.context, label.id)

  const baseClient = createMockTrelloClient({})
  const noLabelsClient: TrelloClient = {
    ...baseClient,
    async addCardLabel() {
      return card
    },
  }
  const noLabels = createContext(
    {
      boardDetail,
      boardLabels: [label],
      credentials,
      selectedCardDetail,
    },
    noLabelsClient,
  )
  await addCardLabel(noLabels.context, label.id)

  expect(noLabels.state.selectedCardDetail?.card.labels).toEqual([label])
  expect(noLabels.state.addingCardLabelId).toBe('')
})

test('drag actions handle invalid names, repeated targets, and event fallbacks', async () => {
  const testContext = createContext({
    boardDetail,
    draggedCardId: card.id,
  })
  const { context, state } = testContext

  handleDragStartEvent(context, { name: 'other', type: 'dragstart' })
  expect(state.draggedCardId).toBe('')

  state.dragTargetListId = 'list-1'
  handleDragOverEvent(context, { name: 'list:list-1', type: 'dragover' })
  state.dragTargetListId = ''
  handleDragLeaveEvent(context)

  const events: readonly ViewEvent[] = [
    {
      name: 'other',
      type: 'drop',
      value: card.id,
    },
    {
      data: card.id,
      name: 'other',
      type: 'drop',
    } as ViewEvent,
    {
      name: 'other',
      text: card.id,
      type: 'drop',
    } as ViewEvent,
    {
      name: 'other',
      type: 'drop',
      value: 42,
    },
  ]
  for (const event of events) {
    await handleDropEvent(context, event)
  }

  expect(state.draggedCardId).toBe('')
  expect(state.dragTargetListId).toBe('')
})

test('focus, image, and input actions handle missing and fallback values', async () => {
  const { context, state } = createContext({
    boardDetail,
    failedCardAttachmentImageIds: ['failed'],
  })

  handleFocusEvent(context, { type: 'focus' })
  handleFocusEvent(context, {
    name: 'listTitle:missing',
    type: 'focus',
  })
  handleImageErrorEvent(context, '')
  handleImageErrorEvent(context, 'failed')
  await handleInputEvent(context, {
    name: 'newLabelName',
    type: 'input',
    value: 42,
  })
  await handleInputEvent(context, {
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Updated title',
  })

  expect(state.focusedName).toBe('listTitle:missing')
  expect(state.failedCardAttachmentImageIds).toEqual(['failed'])
  expect(state.draftNewLabelName).toBe('')
  expect(state.draftListTitles).toEqual({
    'list-1': 'Updated title',
  })
})

test('keyboard actions use key and code values and cancel comments', async () => {
  const { context, state } = createContext({
    writingComment: true,
  })

  await handleKeyDownEvent(context, {
    key: 'Enter',
    name: 'other',
    type: 'keydown',
  } as ViewEvent)
  await handleKeyDownEvent(context, {
    code: 'Escape',
    name: 'cardComment',
    type: 'keydown',
  } as ViewEvent)

  expect(state.writingComment).toBe(false)
})

test('resize actions ignore inactive resizing and accept numeric coordinates', () => {
  const { context, getRerenderCount, state } = createContext()

  resizeCardDetail(context, {
    clientX: 100,
    type: 'pointermove',
  } as ViewEvent)
  stopResizeCardDetail(context)
  startResizeCardDetail(context, {
    clientX: 100,
    type: 'pointerdown',
  } as ViewEvent)

  expect(state.cardDetailResizeStartX).toBe(100)
  expect(getRerenderCount()).toBe(1)
})

test('board update helpers handle absent details and unrelated records', () => {
  const emptyState = createInitialState()
  updateBoardDetailCard(emptyState, card)
  updateBoardDetailList(emptyState, list)
  expect(findBoardCard(emptyState, card.id)).toBeUndefined()

  const state = {
    ...createInitialState(),
    boardDetail: {
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
  }
  updateBoardDetailCard(state, {
    id: 'missing-card',
    name: 'Missing',
  })
  updateBoardDetailList(state, {
    cards: [],
    id: 'missing-list',
    name: 'Missing',
  })
  expect(state.boardDetail.lists).toHaveLength(2)
})

test('canceling a description edit handles a missing selected card', () => {
  const { context, state } = createContext({
    draftCardDescription: 'Draft',
    editingCardDescription: true,
  })

  cancelCardDescriptionEdit(context)

  expect(state.draftCardDescription).toBe('')
  expect(state.editingCardDescription).toBe(false)
})

test('loadBoards handles missing credentials and cached unchanged results', async () => {
  const missingCredentials = createContext()
  await loadBoards(missingCredentials.context)
  expect(missingCredentials.getRerenderCount()).toBe(0)

  const baseClient = createMockTrelloClient({})
  const cachedClient: TrelloClient = {
    ...baseClient,
    async listBoardsCacheFirst() {
      return {
        cached: [board],
        fresh: Promise.resolve([board]),
      }
    },
  }
  const cached = createContext(
    {
      credentials,
    },
    cachedClient,
  )
  await loadBoards(cached.context, false)

  expect(cached.state.boards).toEqual([board])
  expect(cached.state.loading).toBe(false)
  expect(cached.getRerenderCount()).toBe(0)
})

test('restoreCurrentBoard handles guards, missing boards, and cached data', async () => {
  const errorState = createContext({
    credentials,
    error: 'Existing error',
  })
  await restoreCurrentBoard(errorState.context)

  const noBoardId = createContext({
    credentials,
  })
  await restoreCurrentBoard(noBoardId.context)

  const missingBoard = createContext({
    boards: [board],
    credentials,
  })
  await missingBoard.context.currentBoardStorage.write('missing')
  await restoreCurrentBoard(missingBoard.context)
  await expect(
    missingBoard.context.currentBoardStorage.read(),
  ).resolves.toBeUndefined()

  const baseClient = createMockTrelloClient({})
  const cachedClient: TrelloClient = {
    ...baseClient,
    async getBoardDetailCacheFirst() {
      return {
        cached: boardDetail,
        fresh: Promise.resolve(boardDetail),
      }
    },
  }
  const cached = createContext(
    {
      boards: [board],
      credentials,
    },
    cachedClient,
  )
  await cached.context.currentBoardStorage.write(board.id)
  await restoreCurrentBoard(cached.context)

  expect(cached.state.boardDetail).toEqual(boardDetail)
  expect(cached.state.loading).toBe(false)
})
