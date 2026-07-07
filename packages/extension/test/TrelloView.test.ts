// cspell:ignore prefs

import type { VirtualDomViewInstance } from '@lvce-editor/api'
import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCard,
  TrelloCardDetail,
  TrelloCardMove,
  TrelloCardUpdate,
  TrelloCredentials,
  TrelloLabel,
  TrelloSearchResult,
  TrelloList,
  TrelloListUpdate,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMockTrelloClient } from '../src/parts/MockTrelloClient/MockTrelloClient.ts'
import {
  createMemoryRecentBoardStorage,
  type RecentBoardView,
} from '../src/parts/RecentBoardStorage/RecentBoardStorage.ts'
import {
  backToBoardsActiveTrelloViewInstance,
  cancelNewCardActiveTrelloViewInstance,
  closeCardDetailActiveTrelloViewInstance,
  reloadActiveTrelloViewInstances,
  resetTrelloViewDependencyFactory,
  saveCardDetailActiveTrelloViewInstance,
  setTrelloViewDependencyFactory,
  submitNewCardActiveTrelloViewInstance,
  view,
} from '../src/parts/TrelloView/TrelloView.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'
const validLongToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijkl'

const getText = (dom: readonly any[]): string => {
  return dom
    .filter((node) => typeof node.text === 'string')
    .map((node) => node.text)
    .join('\n')
}

const getClassNames = (dom: readonly any[]): readonly string[] => {
  return dom
    .map((node) => node.className)
    .filter((className): className is string => typeof className === 'string')
}

const getNodeEndIndex = (dom: readonly any[], index: number): number => {
  let nextIndex = index + 1
  const childCount = dom[index]?.childCount || 0
  for (let i = 0; i < childCount; i++) {
    nextIndex = getNodeEndIndex(dom, nextIndex)
  }
  return nextIndex
}

const hasDirectChildClass = (
  dom: readonly any[],
  parentClassName: string,
  childClassName: string,
): boolean => {
  for (let i = 0; i < dom.length; i++) {
    if (dom[i].className !== parentClassName) {
      continue
    }
    let childIndex = i + 1
    const childCount = dom[i].childCount || 0
    for (let j = 0; j < childCount; j++) {
      if (dom[childIndex]?.className === childClassName) {
        return true
      }
      childIndex = getNodeEndIndex(dom, childIndex)
    }
  }
  return false
}

const getDirectChildClassNamesByName = (
  dom: readonly any[],
  name: string,
): readonly string[] => {
  const index = dom.findIndex((node) => {
    return node.name === name
  })
  if (index === -1) {
    return []
  }
  const classNames: string[] = []
  let childIndex = index + 1
  const childCount = dom[index]?.childCount || 0
  for (let i = 0; i < childCount; i++) {
    const className = dom[childIndex]?.className
    if (typeof className === 'string') {
      classNames.push(className)
    }
    childIndex = getNodeEndIndex(dom, childIndex)
  }
  return classNames
}

const hasNode = (
  dom: readonly any[],
  predicate: (node: any) => boolean,
): boolean => {
  return dom.some(predicate)
}

const hasLabelText = (dom: readonly any[], text: string): boolean => {
  return dom.some((node, index) => {
    return (
      node.type === VirtualDomElements.Label && dom[index + 1]?.text === text
    )
  })
}

const hasClass = (node: any, className: string): boolean => {
  if (typeof node.className !== 'string') {
    return false
  }
  return node.className.split(' ').includes(className)
}

const getNodeByClass = (dom: readonly any[], className: string): any => {
  return dom.find((node) => hasClass(node, className))
}

const getListTitleInput = (dom: readonly any[], listId: string): any => {
  return dom.find((node) => {
    return node.name === `listTitle:${listId}`
  })
}

const getNodeByName = (dom: readonly any[], name: string): any => {
  return dom.find((node) => {
    return node.name === name
  })
}

const getSubtreeTextByNodeName = (
  dom: readonly any[],
  name: string,
): string => {
  const index = dom.findIndex((node) => {
    return node.name === name
  })
  if (index === -1) {
    return ''
  }
  const endIndex = getNodeEndIndex(dom, index)
  return getText(dom.slice(index, endIndex))
}

const getBoardButtonLabels = (dom: readonly any[]): readonly string[] => {
  const labels: string[] = []
  for (let i = 0; i < dom.length; i++) {
    const node = dom[i]
    if (typeof node.name === 'string' && node.name.startsWith('board:')) {
      labels.push(dom[i + 1]?.text || '')
    }
  }
  return labels
}

const createAuthenticatedInstance = async (
  boards: readonly TrelloBoard[],
  recentBoardViews: readonly RecentBoardView[] = [],
  options: {
    readonly boardBackgroundEnabled?: boolean
    readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
    readonly boardLabels?: Readonly<Record<string, readonly TrelloLabel[]>>
    readonly cardCreateErrors?: Readonly<Record<string, string>>
    readonly cardDetails?: Readonly<Record<string, TrelloCardDetail>>
    readonly cardLabelAddErrors?: Readonly<Record<string, string>>
    readonly cardMoveErrors?: Readonly<Record<string, string>>
    readonly listUpdateErrors?: Readonly<Record<string, string>>
    readonly showContextMenu?: (
      menuId: string,
      x: number,
      y: number,
    ) => Promise<void>
  } = {},
): Promise<VirtualDomViewInstance> => {
  const {
    boardDetails,
    boardLabels,
    cardCreateErrors,
    cardDetails,
    cardLabelAddErrors,
    cardMoveErrors,
    listUpdateErrors,
  } = options
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards,
      ...(boardDetails && { boardDetails }),
      ...(boardLabels && { boardLabels }),
      ...(cardCreateErrors && { cardCreateErrors }),
      ...(cardDetails && { cardDetails }),
      ...(cardLabelAddErrors && { cardLabelAddErrors }),
      ...(cardMoveErrors && { cardMoveErrors }),
      ...(listUpdateErrors && { listUpdateErrors }),
    }),
    readBoardBackgroundEnabled: async (): Promise<boolean> => {
      return options.boardBackgroundEnabled === true
    },
    recentStorage: createMemoryRecentBoardStorage(recentBoardViews),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create(
    options.showContextMenu
      ? ({
          showContextMenu: options.showContextMenu,
        } as any)
      : undefined,
  )) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  return instance
}

interface SearchInstanceData {
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly cardDetails?: Readonly<Record<string, TrelloCardDetail>>
  readonly searchError?: string
  readonly searchResults?: readonly TrelloSearchResult[]
}

const createSearchEnabledInstance = async (
  data: Readonly<SearchInstanceData>,
  options: {
    readonly boardBackgroundEnabled?: boolean
  } = {},
): Promise<VirtualDomViewInstance> => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient(data),
    readBoardBackgroundEnabled: async (): Promise<boolean> => {
      return options.boardBackgroundEnabled === true
    },
    readSearchEnabled: async (): Promise<boolean> => true,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  return instance
}

const createDeferred = <T>(): PromiseWithResolvers<T> => {
  return Promise.withResolvers<T>()
}

test('renders auth inputs when unauthenticated', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  const dom = await instance.render()
  const text = getText(dom)

  expect(text).toContain('API key')
  expect(text).toContain('Token')
  expect(text).toContain('Welcome to Trello')
  expect(text).toContain('https://trello.com/power-ups/admin')
  expect(text).toContain('The token grants access to your Trello account')
  expect(hasLabelText(dom, 'API key')).toBe(true)
  expect(hasLabelText(dom, 'Token')).toBe(true)
  const apiKeyInput = dom.find((node) => node.name === 'apiKey')
  const tokenInput = dom.find((node) => node.name === 'token')
  if (!apiKeyInput || !tokenInput) {
    throw new Error('Expected auth inputs to render')
  }
  expect(apiKeyInput.inputType).toBeUndefined()
  expect(tokenInput.inputType).toBe('password')
  expect(
    hasNode(dom, (node) => {
      return (
        node.className === 'TrelloWelcomeLink' &&
        node.href === 'https://trello.com/power-ups/admin' &&
        node.target === '_blank'
      )
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('dependency reload resets authenticated user state without clearing user credentials in test mode', async () => {
  const userStorage = createMemoryCredentialStorage({
    apiKey: validApiKey,
    token: validToken,
  })
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards: [{ id: 'user-board', name: 'User Board' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: userStorage,
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  expect(getText(await instance.render())).toContain('User Board')

  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    isTest: true,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))
  await reloadActiveTrelloViewInstances()

  const authText = getText(await instance.render())
  expect(authText).toContain('API key')
  expect(authText).not.toContain('User Board')

  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain('Roadmap')
  await expect(userStorage.read()).resolves.toEqual({
    apiKey: validApiKey,
    token: validToken,
  })
  await instance.dispose?.()
  resetTrelloViewDependencyFactory()
})

test('connect loads boards and clicking board loads detail', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [
                {
                  badges: {
                    comments: 3,
                  },
                  id: 'card-1',
                  name: 'Ship Trello view',
                },
                {
                  badges: {
                    comments: 0,
                  },
                  cover: {
                    scaled: [
                      {
                        url: 'https://example.com/quiet-card-small.png',
                      },
                      {
                        url: 'https://example.com/quiet-card-large.png',
                      },
                    ],
                  },
                  id: 'card-2',
                  name: 'Quiet card',
                },
                {
                  id: 'card-3',
                  name: 'Plain card',
                },
              ],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const boardsText = getText(await instance.render())
  expect(boardsText).toContain('Roadmap')
  expect(boardsText).not.toContain('Welcome to Trello')
  expect(boardsText).not.toContain('https://trello.com/power-ups/admin')

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const detailDom = await instance.render()
  const detailText = getText(detailDom)
  const detailClassNames = getClassNames(detailDom)
  expect(getListTitleInput(detailDom, 'list-1')?.value).toBe('Todo')
  expect(detailText).toContain('Ship Trello view')
  expect(detailText).toContain('+ Add a card')
  expect(detailText).not.toContain('3 comments')
  expect(getSubtreeTextByNodeName(detailDom, 'card:card-1')).toContain('3')
  expect(detailText).toContain('Quiet card')
  expect(detailText).toContain('Plain card')
  expect(detailText).not.toContain('0 comments')
  expect(getNodeByClass(detailDom, 'TrelloCardMeta')).toMatchObject({
    'aria-label': '3 comments',
    title: '3 comments',
  })
  expect(detailClassNames).toContain('TrelloLists')
  expect(detailClassNames).toContain('TrelloList')
  expect(detailClassNames).toContain('TrelloCards')
  expect(detailClassNames).toContain('TrelloCardTitle')
  expect(detailClassNames).toContain('TrelloCardMeta')
  expect(detailClassNames).toContain('TrelloCardCommentIcon')
  expect(detailClassNames).toContain('TrelloCardCommentCount')
  expect(detailClassNames).toContain('TrelloCardCoverImage')
  expect(
    hasNode(detailDom, (node) => {
      return hasClass(node, 'TrelloCardWithCover')
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'TrelloCardCoverImage' &&
        node.src === 'https://example.com/quiet-card-large.png' &&
        node.alt === 'Quiet card cover'
      )
    }),
  ).toBe(true)
  expect(hasDirectChildClass(detailDom, 'TrelloList', 'TrelloCards')).toBe(true)
  expect(
    hasDirectChildClass(detailDom, 'TrelloList', 'TrelloAddCardButton'),
  ).toBe(true)
  expect(hasDirectChildClass(detailDom, 'TrelloCards', 'TrelloCard')).toBe(true)
  expect(getDirectChildClassNamesByName(detailDom, 'list:list-1')).toEqual([
    'TrelloListTitleInput',
    'TrelloCards',
    'TrelloAddCardButton',
  ])
  expect(getNodeByName(detailDom, 'addCard:list-1')).toEqual(
    expect.objectContaining({
      className: 'TrelloAddCardButton',
      name: 'addCard:list-1',
      onClick: 'handleClick',
    }),
  )
  resetTrelloViewDependencyFactory()
})

test('list title renders as editable input', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const dom = await instance.render()
  const title = getListTitleInput(dom, 'list-1')
  expect(title).toEqual(
    expect.objectContaining({
      className: 'TrelloListTitleInput',
      name: 'listTitle:list-1',
      onBlur: 'handleBlur',
      onInput: 'handleInput',
      value: 'Todo',
    }),
  )
  expect(getText(dom)).toContain('No cards')
  expect(getText(dom)).toContain('+ Add a card')
  expect(getNodeByName(dom, 'addCard:list-1')).toEqual(
    expect.objectContaining({
      className: 'TrelloAddCardButton',
      name: 'addCard:list-1',
      onClick: 'handleClick',
    }),
  )
  resetTrelloViewDependencyFactory()
})

test('cards and lists render drag and drop attributes', async () => {
  expect(view.eventListeners).toEqual([
    {
      name: 'handleDragStart',
      params: ['handleViewEvent', 'dragstart', 'event.target.name'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleViewEvent', 'dragend', 'event.target.name'],
    },
    {
      name: 'handleDragOver',
      params: ['handleViewEvent', 'dragover', 'event.target.name'],
      preventDefault: true,
    },
    {
      name: 'handleDragLeave',
      params: ['handleViewEvent', 'dragleave', 'event.target.name'],
    },
    {
      name: 'handleDrop',
      params: ['handleViewEvent', 'drop', 'event.target.name'],
      preventDefault: true,
    },
  ])
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'card:card-1')).toEqual(
    expect.objectContaining({
      className: 'TrelloCard',
      draggable: true,
      name: 'card:card-1',
      onContextMenu: 'handleContextMenu',
      onDragEnd: 'handleDragEnd',
      onDragStart: 'handleDragStart',
    }),
  )
  expect(getNodeByName(dom, 'card:card-1')).not.toEqual(
    expect.objectContaining({
      onClick: 'handleClick',
    }),
  )
  expect(getNodeByName(dom, 'list:list-1')).toEqual(
    expect.objectContaining({
      className: 'TrelloList',
      name: 'list:list-1',
      onClick: 'handleClick',
      onContextMenu: 'handleContextMenu',
      onDragLeave: 'handleDragLeave',
      onDragOver: 'handleDragOver',
      onDrop: 'handleDrop',
    }),
  )

  await instance.handleEvent?.({
    name: 'list:list-1',
    type: 'contextmenu',
    x: 100,
    y: 200,
  })
  expect(contextMenuInvocations).toEqual([['trello.list', 100, 200]])
  expect((instance as any).getMenuEntries('trello.list')).toEqual([
    {
      args: ['list-1'],
      command: 'trello.startAddCard',
      id: 'addCard',
      label: 'Add Card',
    },
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
  expect(await instance.render()).toEqual(dom)
  resetTrelloViewDependencyFactory()
})

test('clicking add card renders input for that list only', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      autocomplete: 'off',
      className: 'TrelloAddCardInput',
      name: 'newCardTitle:list-1',
      onInput: 'handleInput',
      value: '',
    }),
  )
  expect(getNodeByName(dom, 'newCardTitle:list-2')).toBeUndefined()
  expect(
    hasNode(dom, (node) => {
      return (
        node.name === 'addCard:list-2' &&
        node.className === 'TrelloAddCardButton'
      )
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('board overview context menu opens board menu', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )

  const dom = await instance.render()
  expect(getNodeByName(dom, 'boards')).toEqual(
    expect.objectContaining({
      name: 'boards',
      onContextMenu: 'handleContextMenu',
    }),
  )

  await instance.handleEvent?.({
    name: 'boards',
    type: 'contextmenu',
    x: 11,
    y: 22,
  })

  expect(contextMenuInvocations).toEqual([['trello.board', 11, 22]])
  expect((instance as any).getMenuEntries('trello.board')).toEqual([
    {
      command: 'trello.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'trello.logout',
      id: 'signOut',
      label: 'Sign Out',
    },
  ])
  resetTrelloViewDependencyFactory()
})

test('card context menu opens card menu with target args', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  await instance.handleEvent?.({
    name: 'card:card-1',
    type: 'contextmenu',
    x: 33,
    y: 44,
  })

  expect(contextMenuInvocations).toEqual([['trello.card', 33, 44]])
  expect((instance as any).getMenuEntries('trello.card')).toEqual([
    {
      args: ['card-1'],
      command: 'trello.openCard',
      id: 'openCard',
      label: 'Open Card',
    },
    {
      args: ['list-1'],
      command: 'trello.startAddCard',
      id: 'addCard',
      label: 'Add Card',
    },
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
  resetTrelloViewDependencyFactory()
})

test('card detail context menu opens card detail menu', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'cardDetail')).toEqual(
    expect.objectContaining({
      name: 'cardDetail',
      onContextMenu: 'handleContextMenu',
    }),
  )

  await instance.handleEvent?.({
    name: 'cardDetail',
    type: 'contextmenu',
    x: 55,
    y: 66,
  })

  expect(contextMenuInvocations).toEqual([['trello.cardDetail', 55, 66]])
  expect((instance as any).getMenuEntries('trello.cardDetail')).toEqual([
    {
      command: 'trello.saveCardDetail',
      id: 'saveCard',
      label: 'Save Card',
    },
    {
      command: 'trello.closeCardDetail',
      id: 'closeCard',
      label: 'Close Card',
    },
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
  resetTrelloViewDependencyFactory()
})

test('view context tracks board and new-card input focus', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  const withContext = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
  }

  expect(withContext.getContext()).toEqual({
    'trello.boardsFocus': true,
  })

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  expect(withContext.getContext()).toEqual({
    'trello.boardDetailFocus': true,
  })

  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'focus',
  })
  expect(withContext.getContext()).toEqual({
    'trello.boardDetailFocus': true,
    'trello.newCardInputFocus': true,
  })

  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'blur',
  })
  expect(withContext.getContext()).toEqual({
    'trello.boardDetailFocus': true,
  })

  resetTrelloViewDependencyFactory()
})

test('active keybinding commands submit and cancel new card input', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build shortcuts',
  })
  await submitNewCardActiveTrelloViewInstance()
  expect(getText(await instance.render())).toContain('Build shortcuts')

  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  cancelNewCardActiveTrelloViewInstance()
  expect(
    getNodeByName(await instance.render(), 'newCardTitle:list-1'),
  ).toBeUndefined()

  resetTrelloViewDependencyFactory()
})

test('active keybinding commands navigate board and close card detail', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  expect(getText(await instance.render())).toContain('Plan work')

  closeCardDetailActiveTrelloViewInstance()
  expect(
    getNodeByName(await instance.render(), 'closeCardDetail'),
  ).toBeUndefined()

  await backToBoardsActiveTrelloViewInstance()
  expect(getBoardButtonLabels(await instance.render())).toContain('Roadmap')

  resetTrelloViewDependencyFactory()
})

test('active keybinding command saves card description', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  const withContext = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
  }

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'focus' })
  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Shortcut saved description',
  })

  expect(withContext.getContext()).toEqual({
    'trello.boardDetailFocus': true,
    'trello.cardDescriptionFocus': true,
    'trello.cardDetailFocus': true,
  })

  await saveCardDetailActiveTrelloViewInstance()
  const text = getText(await instance.render())
  expect(text).toContain('Shortcut saved description')

  resetTrelloViewDependencyFactory()
})

test('submitting add card appends card and hides input', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  const todoText = getSubtreeTextByNodeName(dom, 'list:list-1')
  const doingText = getSubtreeTextByNodeName(dom, 'list:list-2')
  expect(todoText).toContain('Plan work')
  expect(todoText).toContain('Build add card')
  expect(todoText.indexOf('Plan work')).toBeLessThan(
    todoText.indexOf('Build add card'),
  )
  expect(doingText).not.toContain('Build add card')
  expect(getNodeByName(dom, 'newCardTitle:list-1')).toBeUndefined()
  expect(
    hasNode(dom, (node) => {
      return (
        node.name === 'addCard:list-1' &&
        node.className === 'TrelloAddCardButton'
      )
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('submitting blank add card keeps input open with error', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')?.value).toBe(' '.repeat(3))
  expect(getText(dom)).toContain('Card title is required.')
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).not.toContain(
    'created-card',
  )
  resetTrelloViewDependencyFactory()
})

test('add card failure keeps input open and preserves draft', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardCreateErrors: {
        'list-1': 'Cannot create card',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')?.value).toBe(
    'Build add card',
  )
  expect(getText(dom)).toContain('Cannot create card')
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).not.toContain(
    'Build add card',
  )
  resetTrelloViewDependencyFactory()
})

test('drag over marks list as drag target', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'dragstart' })
  await instance.handleEvent?.({ name: 'list:list-1', type: 'dragover' })

  const dragTargetDom = await instance.render()
  expect(
    hasClass(
      getNodeByName(dragTargetDom, 'list:list-1'),
      'TrelloListDragTarget',
    ),
  ).toBe(true)

  await instance.handleEvent?.({ name: 'list:list-1', type: 'dragleave' })
  const clearedDom = await instance.render()
  expect(
    hasClass(getNodeByName(clearedDom, 'list:list-1'), 'TrelloListDragTarget'),
  ).toBe(false)
  resetTrelloViewDependencyFactory()
})

test('dropping card on another list moves card to bottom', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'dragstart' })
  await instance.handleEvent?.({ name: 'list:list-2', type: 'drop' })

  const dom = await instance.render()
  const todoText = getSubtreeTextByNodeName(dom, 'list:list-1')
  const doingText = getSubtreeTextByNodeName(dom, 'list:list-2')
  expect(todoText).not.toContain('Plan work')
  expect(doingText).toContain('Build work')
  expect(doingText).toContain('Plan work')
  expect(doingText.indexOf('Build work')).toBeLessThan(
    doingText.indexOf('Plan work'),
  )
  resetTrelloViewDependencyFactory()
})

test('dropping card on the same list is a no-op', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Move should not be called',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'dragstart' })
  await instance.handleEvent?.({ name: 'list:list-1', type: 'drop' })

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getText(dom)).not.toContain('Move should not be called')
  resetTrelloViewDependencyFactory()
})

test('failed card drop preserves placement and shows error', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Cannot move card',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'dragstart' })
  await instance.handleEvent?.({ name: 'list:list-2', type: 'drop' })

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getText(dom)).toContain('Cannot move card')
  resetTrelloViewDependencyFactory()
})

test('editing list title saves on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Doing',
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const title = getListTitleInput(await instance.render(), 'list-1')
  expect(title?.value).toBe('Doing')
  expect(getText(await instance.render())).not.toContain(
    'List title is required.',
  )
  resetTrelloViewDependencyFactory()
})

test('empty list title restores old title on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const dom = await instance.render()
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(getText(dom)).toContain('List title is required.')
  resetTrelloViewDependencyFactory()
})

test('failed list title update restores old title on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      listUpdateErrors: {
        'list-1': 'Trello request failed: 500 unavailable',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Doing',
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const dom = await instance.render()
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(getText(dom)).toContain('Trello request failed: 500 unavailable')
  resetTrelloViewDependencyFactory()
})
test('clicking card renders card detail and close dismisses it', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship Trello view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [
            {
              id: 'attachment-1',
              mimeType: 'image/png',
              name: 'Screenshot',
              url: 'https://example.com/screenshot.png',
            },
          ],
          card: {
            desc: 'Detailed card description',
            id: 'card-1',
            labels: [
              {
                color: 'blue',
                id: 'label-1',
                idBoard: 'board-1',
                name: 'Extension Api',
              },
            ],
            name: 'Ship Trello view',
            url: 'https://trello.com/c/card-1',
          },
          comments: [
            {
              data: {
                text: 'This should show under the description.',
              },
              date: '2026-07-03T10:11:00.000Z',
              id: 'comment-1',
              memberCreator: {
                fullName: 'Test User',
                initials: 'TU',
              },
            },
          ],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Detailed card description')
  expect(text).toContain('Comments')
  expect(text).toContain('TU')
  expect(text).toContain('Test User')
  expect(text).toContain('Jul 3, 2026, 12:11 PM')
  expect(text).toContain('This should show under the description.')
  expect(text).toContain('Extension Api')
  expect(text).toContain('Open in Trello')
  expect(text.indexOf('Detailed card description')).toBeLessThan(
    text.indexOf('Comments'),
  )
  expect(text.indexOf('Test User')).toBeLessThan(
    text.indexOf('Jul 3, 2026, 12:11 PM'),
  )
  expect(text.indexOf('Jul 3, 2026, 12:11 PM')).toBeLessThan(
    text.indexOf('This should show under the description.'),
  )
  expect(text.indexOf('This should show under the description.')).toBeLessThan(
    text.indexOf('Images'),
  )
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailPanel')
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailImage')
  expect(getClassNames(detailDom)).toContain('TrelloCardComments')
  expect(getClassNames(detailDom)).toContain('TrelloCardComment')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentAvatar')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentContent')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentHeader')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentAuthor')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentDate')
  expect(getClassNames(detailDom)).toContain('TrelloCardCommentText')
  expect(hasDirectChildClass(detailDom, 'TrelloCards', 'TrelloCard')).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'TrelloCardDetailImage' &&
        node.src === 'https://example.com/screenshot.png'
      )
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        typeof node.className === 'string' &&
        node.className.includes('TrelloCardLabel') &&
        node.className.includes('TrelloCardLabelColorBlue')
      )
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'TrelloCardDetailLink' &&
        node.href === 'https://trello.com/c/card-1'
      )
    }),
  ).toBe(true)
  expect(text).not.toContain('Close')
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.name === 'closeCardDetail' &&
        typeof node.className === 'string' &&
        node.className.includes('TrelloCardDetailCloseButton')
      )
    }),
  ).toBe(true)

  await instance.handleEvent?.({ name: 'closeCardDetail', type: 'click' })

  const closedDom = await instance.render()
  expect(getListTitleInput(closedDom, 'list-1')?.value).toBe('Todo')
  expect(getText(closedDom)).toContain('Ship Trello view')
  expect(getClassNames(closedDom)).not.toContain('TrelloCardDetailPanel')
  resetTrelloViewDependencyFactory()
})

test('card detail label picker adds an existing board label', async () => {
  const labels: readonly TrelloLabel[] = [
    {
      color: 'blue',
      id: 'label-1',
      idBoard: 'board-1',
      name: 'Extension Api',
    },
    {
      color: 'red',
      id: 'label-2',
      idBoard: 'board-1',
      name: 'Bug',
    },
  ]
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship Trello view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boardLabels: {
        'board-1': labels,
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            labels: [],
            name: 'Ship Trello view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const initialDom = await instance.render()
  expect(getText(initialDom)).toContain('Labels')
  expect(getNodeByName(initialDom, 'cardLabelPicker')).toBeUndefined()

  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })

  const openDom = await instance.render()
  expect(getNodeByName(openDom, 'cardLabelSearch')?.value).toBe('')
  expect(getSubtreeTextByNodeName(openDom, 'cardLabelPicker')).toContain(
    'Extension Api',
  )
  expect(getSubtreeTextByNodeName(openDom, 'cardLabelPicker')).toContain('Bug')

  await instance.handleEvent?.({
    name: 'cardLabelSearch',
    type: 'input',
    value: 'bug',
  })

  const filteredDom = await instance.render()
  const filteredPickerText = getSubtreeTextByNodeName(
    filteredDom,
    'cardLabelPicker',
  )
  expect(filteredPickerText).toContain('Bug')
  expect(filteredPickerText).not.toContain('Extension Api')

  await instance.handleEvent?.({ name: 'addCardLabel:label-2', type: 'click' })

  const updatedDom = await instance.render()
  expect(getText(updatedDom)).toContain('Bug')
  expect(getNodeByName(updatedDom, 'cardLabelPicker')).toBeUndefined()
  expect(getNodeByName(updatedDom, 'openCardLabelPicker')).toBeDefined()
  resetTrelloViewDependencyFactory()
})

test('card detail label picker excludes assigned labels and keeps open on failure', async () => {
  const labels: readonly TrelloLabel[] = [
    {
      color: 'blue',
      id: 'label-1',
      idBoard: 'board-1',
      name: 'Extension Api',
    },
    {
      color: 'red',
      id: 'label-2',
      idBoard: 'board-1',
      name: 'Bug',
    },
  ]
  const appliedLabel = labels[0]
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [
                {
                  id: 'card-1',
                  labels: [appliedLabel],
                  name: 'Ship Trello view',
                },
              ],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boardLabels: {
        'board-1': labels,
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            labels: [appliedLabel],
            name: 'Ship Trello view',
          },
          comments: [],
        },
      },
      cardLabelAddErrors: {
        'card-1': 'Trello request failed: 500 unavailable',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const labeledDom = await instance.render()
  expect(getText(labeledDom)).toContain('Extension Api')
  expect(getNodeByName(labeledDom, 'openCardLabelPicker')).toBeDefined()

  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })

  const pickerDom = await instance.render()
  const pickerText = getSubtreeTextByNodeName(pickerDom, 'cardLabelPicker')
  expect(pickerText).toContain('Bug')
  expect(pickerText).not.toContain('Extension Api')

  await instance.handleEvent?.({ name: 'addCardLabel:label-2', type: 'click' })

  const failedDom = await instance.render()
  expect(getText(failedDom)).toContain('Trello request failed: 500 unavailable')
  expect(getNodeByName(failedDom, 'cardLabelPicker')).toBeDefined()
  expect(getText(failedDom)).not.toContain('No labels available')
  resetTrelloViewDependencyFactory()
})

test('card detail title renders as wrapping textarea with full long title', async () => {
  const longTitle =
    'trello: input fields on firefox look not so good when the card detail title needs more than one line'
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: longTitle }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: longTitle,
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailTitleSizer')
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailTitleMirror')
  expect(getText(detailDom)).toContain(longTitle)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.name === 'cardTitle' &&
        node.type === VirtualDomElements.TextArea &&
        node.rows === 1 &&
        node.value === longTitle &&
        hasClass(node, 'TrelloCardDetailTitleInput')
      )
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('clicking card renders cached detail before fresh detail resolves', async () => {
  const boardDetail: TrelloBoardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship Trello view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  const cachedCardDetail: TrelloCardDetail = {
    attachments: [],
    card: {
      desc: 'Cached description',
      id: 'card-1',
      name: 'Ship Trello view',
    },
    comments: [],
  }
  const freshCardDetail = {
    ...cachedCardDetail,
    card: {
      ...cachedCardDetail.card,
      desc: 'Fresh description',
    },
  }
  const freshCardDeferred = createDeferred<TrelloCardDetail>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const client: TrelloClient = {
    async addCardLabel(card: TrelloCard) {
      return card
    },
    async createCard(list: TrelloList) {
      return {
        id: 'created-card-1',
        idList: list.id,
        name: 'Created card',
      }
    },
    async getBoardDetail() {
      return boardDetail
    },
    async getBoardDetailCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve(boardDetail),
      }
    },
    async getCardDetail() {
      return freshCardDeferred.promise
    },
    async getCardDetailCacheFirst() {
      return {
        cached: cachedCardDetail,
        fresh: freshCardDeferred.promise,
      }
    },
    async listBoardLabels() {
      return []
    },
    async listBoards() {
      return boards
    },
    async listBoardsCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve(boards),
      }
    },
    async moveCard(card: TrelloCard, move: TrelloCardMove) {
      return {
        ...card,
        idList: move.idList,
      }
    },
    async search() {
      return []
    },
    async searchCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve([]),
      }
    },
    async updateCard(card: TrelloCard, update: TrelloCardUpdate) {
      return {
        ...card,
        ...update,
      }
    },
    async updateList(list: TrelloList, update: TrelloListUpdate) {
      return {
        ...list,
        ...update,
      }
    },
  }
  setTrelloViewDependencyFactory(() => ({
    client,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const openCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>
  await Promise.resolve()

  expect(getText(await instance.render())).toContain('Cached description')
  freshCardDeferred.resolve(freshCardDetail)
  await openCardPromise

  const refreshedText = getText(await instance.render())
  expect(refreshedText).toContain('Fresh description')
  expect(refreshedText).not.toContain('Cached description')
  resetTrelloViewDependencyFactory()
})

test('editing card title and description saves card detail', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship Trello view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: 'Original description',
            id: 'card-1',
            name: 'Ship Trello view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const initialDom = await instance.render()
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Ship Trello view'
    }),
  ).toBe(true)
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'saveCardDetail'
    }),
  ).toBe(false)

  await instance.handleEvent?.({
    name: 'cardTitle',
    type: 'input',
    value: 'Updated title',
  })
  await instance.handleEvent?.({ name: 'cardTitle', type: 'blur' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })

  const editingDom = await instance.render()
  expect(
    hasNode(editingDom, (node) => {
      return (
        node.name === 'cardDescription' && node.value === 'Original description'
      )
    }),
  ).toBe(true)
  expect(
    hasNode(editingDom, (node) => {
      return node.name === 'saveCardDetail'
    }),
  ).toBe(true)
  expect(
    hasNode(editingDom, (node) => {
      return node.name === 'cancelCardDescriptionEdit'
    }),
  ).toBe(false)

  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Updated description',
  })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'blur' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Updated title')
  expect(text).toContain('Updated description')
  expect(text).not.toContain('Original description')
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Updated title'
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  resetTrelloViewDependencyFactory()
})

test('unchanged card description blur closes editor without saving', async () => {
  let updateCardCallCount = 0
  const client = createMockTrelloClient({
    boardDetails: {
      'board-1': {
        board: { id: 'board-1', name: 'Roadmap' },
        lists: [
          {
            cards: [{ id: 'card-1', name: 'Ship Trello view' }],
            id: 'list-1',
            name: 'Todo',
          },
        ],
      },
    },
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    cardDetails: {
      'card-1': {
        attachments: [],
        card: {
          desc: 'Original description',
          id: 'card-1',
          name: 'Ship Trello view',
        },
        comments: [],
      },
    },
  })
  setTrelloViewDependencyFactory(() => ({
    client: {
      ...client,
      async updateCard(
        card: TrelloCard,
        update: TrelloCardUpdate,
        credentials: TrelloCredentials,
      ): Promise<TrelloCard> {
        updateCardCallCount++
        return client.updateCard(card, update, credentials)
      },
    },
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'blur' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Original description')
  expect(updateCardCallCount).toBe(0)
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  resetTrelloViewDependencyFactory()
})

test('card description preview renders safe markdown subset', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship Trello view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '# Heading\n\n- **Bold** item\n- [Link](https://example.com)\n\nUse `code` and *emphasis*',
            id: 'card-1',
            name: 'Ship Trello view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  expect(getText(detailDom)).toContain('Heading')
  expect(getClassNames(detailDom)).toContain(
    'TrelloMarkdownHeading TrelloMarkdownHeading1',
  )
  expect(getClassNames(detailDom)).toContain('TrelloMarkdownList')
  expect(getClassNames(detailDom)).toContain('TrelloMarkdownStrong')
  expect(getClassNames(detailDom)).toContain('TrelloMarkdownCode')
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'TrelloMarkdownLink' &&
        node.href === 'https://example.com' &&
        node.target === '_blank'
      )
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('empty card title on blur restores saved title and shows validation error', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship Trello view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: 'Ship Trello view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardTitle',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'cardTitle', type: 'blur' })

  const detailDom = await instance.render()
  expect(getText(detailDom)).toContain('Card title is required.')
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Ship Trello view'
    }),
  ).toBe(true)
  resetTrelloViewDependencyFactory()
})

test('connect shows validation error for missing credentials', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain(
    'Enter an API key and token.',
  )
  resetTrelloViewDependencyFactory()
})

test('connect shows validation error for invalid api key shape', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: 'bad-key',
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('API key must be 32 alphanumeric characters.')
  expect(text).toContain('API key')
  expect(text).not.toContain('Roadmap')
  resetTrelloViewDependencyFactory()
})

test('connect accepts 76 character token and loads boards', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validLongToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('Roadmap')
  expect(text).not.toContain('Welcome to Trello')
  resetTrelloViewDependencyFactory()
})

test('connect shows trello error on auth form when credentials fail', async () => {
  const storage = createMemoryCredentialStorage()
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      listBoardsError: 'Trello request failed: 401 invalid key',
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage,
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('Trello request failed: 401 invalid key')
  expect(text).toContain('API key')
  await expect(storage.read()).resolves.toBeUndefined()
  resetTrelloViewDependencyFactory()
})

test('renders recently viewed before workspaces', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-02T00:00:00.000Z',
      id: 'board-1',
      name: 'Roadmap',
      organization: {
        displayName: 'Engineering',
        id: 'org-1',
        name: 'engineering',
      },
    },
  ])

  const text = getText(await instance.render())
  expect(text.indexOf('Recently viewed')).toBeLessThan(
    text.indexOf('Your workspaces'),
  )
  resetTrelloViewDependencyFactory()
})

test('orders recently viewed boards by trello dateLastView', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-01T00:00:00.000Z',
      id: 'board-1',
      name: 'Older',
    },
    {
      dateLastView: '2026-01-03T00:00:00.000Z',
      id: 'board-2',
      name: 'Newer',
    },
  ])

  expect(getBoardButtonLabels(await instance.render()).slice(0, 2)).toEqual([
    'Newer',
    'Older',
  ])
  resetTrelloViewDependencyFactory()
})

test('local recent board views override missing trello dates', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-01T00:00:00.000Z',
      id: 'board-1',
      name: 'Previously viewed',
    },
    {
      id: 'board-2',
      name: 'Opened locally',
    },
  ])

  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })
  await instance.handleEvent?.({ name: 'backToBoards', type: 'click' })

  expect(getBoardButtonLabels(await instance.render()).slice(0, 2)).toEqual([
    'Opened locally',
    'Previously viewed',
  ])
  resetTrelloViewDependencyFactory()
})

test('groups boards by workspace with personal fallback', async () => {
  const instance = await createAuthenticatedInstance([
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
  ])

  const text = getText(await instance.render())
  expect(text).toContain('Product')
  expect(text).toContain('Personal boards')
  resetTrelloViewDependencyFactory()
})

test('renders empty board state', async () => {
  const instance = await createAuthenticatedInstance([])

  expect(getText(await instance.render())).toContain('No boards found')
  resetTrelloViewDependencyFactory()
})

test('does not use trello board background when flag is disabled', async () => {
  const instance = await createAuthenticatedInstance([
    {
      id: 'board-1',
      name: 'Roadmap',
      prefs: {
        backgroundImage: 'https://example.com/background.jpg',
      },
    },
  ])

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'TrelloBoardDetail',
  )
  expect(hasClass(boardDetail, 'TrelloBoardDetailWithBackground')).toBe(false)
  expect(boardDetail.style).toBeUndefined()
  resetTrelloViewDependencyFactory()
})

test('uses largest trello board background image when flag is enabled', async () => {
  const instance = await createAuthenticatedInstance(
    [
      {
        id: 'board-1',
        name: 'Roadmap',
        prefs: {
          backgroundImage: 'https://example.com/original.jpg',
          backgroundImageScaled: [
            {
              height: 120,
              url: 'https://example.com/small.jpg',
              width: 160,
            },
            {
              height: 1080,
              url: 'https://example.com/large.jpg',
              width: 1920,
            },
          ],
        },
      },
    ],
    [],
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'TrelloBoardDetail',
  )
  expect(hasClass(boardDetail, 'TrelloBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toContain(
    '--TrelloBoardBackgroundImage: url("https://example.com/large.jpg")',
  )
  expect(boardDetail.style).toContain(
    '--TrelloBoardBackgroundRepeat: no-repeat',
  )
  expect(boardDetail.style).toContain('--TrelloBoardBackgroundSize: cover')
  resetTrelloViewDependencyFactory()
})

test('uses trello board background color when no image exists', async () => {
  const instance = await createAuthenticatedInstance(
    [
      {
        id: 'board-1',
        name: 'Roadmap',
        prefs: {
          backgroundBottomColor: '#0c66e4',
        },
      },
    ],
    [],
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'TrelloBoardDetail',
  )
  expect(hasClass(boardDetail, 'TrelloBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toBe('--TrelloBoardBackgroundColor: #0c66e4')
  resetTrelloViewDependencyFactory()
})

test('does not render search when flag is disabled', async () => {
  const instance = await createAuthenticatedInstance([
    { id: 'board-1', name: 'Roadmap' },
  ])

  expect(getClassNames(await instance.render())).not.toContain(
    'TrelloSearchForm',
  )
  resetTrelloViewDependencyFactory()
})

test('renders search when flag is enabled', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
  })

  expect(getClassNames(await instance.render())).toContain('TrelloSearchForm')
  expect(getText(await instance.render())).toContain('Roadmap')
  resetTrelloViewDependencyFactory()
})

test('submitting search renders card and board results', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'card-1',
        idBoard: 'board-1',
        name: 'Ship Trello search',
        type: 'card',
      },
      {
        id: 'board-2',
        name: 'Search Board',
        type: 'board',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  const text = getText(await instance.render())
  expect(text).toContain('Search results for "ship"')
  expect(text).toContain('Card: Ship Trello search')
  expect(text).toContain('Board: Search Board')
  resetTrelloViewDependencyFactory()
})

test('submitting empty search clears search results', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'card-1',
        name: 'Ship Trello search',
        type: 'card',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  const text = getText(await instance.render())
  expect(text).toContain('Roadmap')
  expect(text).not.toContain('Search results for "ship"')
  resetTrelloViewDependencyFactory()
})

test('search errors reuse trello error rendering', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchError: 'Trello request failed: 401 unauthorized',
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  expect(getText(await instance.render())).toContain(
    'Trello request failed: 401 unauthorized',
  )
  resetTrelloViewDependencyFactory()
})

test('clicking board search result opens board detail', async () => {
  const instance = await createSearchEnabledInstance({
    boardDetails: {
      'board-2': {
        board: { id: 'board-2', name: 'Search Board' },
        lists: [
          {
            cards: [{ id: 'card-1', name: 'Found card' }],
            id: 'list-1',
            name: 'Todo',
          },
        ],
      },
    },
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'board-2',
        name: 'Search Board',
        type: 'board',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'search board',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })

  const dom = await instance.render()
  const text = getText(dom)
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(text).toContain('Found card')
  resetTrelloViewDependencyFactory()
})

test('uses trello background for board opened from search', async () => {
  const instance = await createSearchEnabledInstance(
    {
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      searchResults: [
        {
          id: 'board-2',
          name: 'Search Board',
          prefs: {
            backgroundImage: 'https://example.com/search-board.jpg',
            backgroundTile: true,
          },
          type: 'board',
        },
      ],
    },
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'search board',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'TrelloBoardDetail',
  )
  expect(hasClass(boardDetail, 'TrelloBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toContain(
    '--TrelloBoardBackgroundImage: url("https://example.com/search-board.jpg")',
  )
  expect(boardDetail.style).toContain('--TrelloBoardBackgroundRepeat: repeat')
  expect(boardDetail.style).toContain('--TrelloBoardBackgroundSize: auto')
  resetTrelloViewDependencyFactory()
})
