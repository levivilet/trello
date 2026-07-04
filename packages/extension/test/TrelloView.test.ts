import type { VirtualDomViewInstance } from '@lvce-editor/api'
import { expect, test } from '@jest/globals'
import type {
  TrelloBoard,
  TrelloBoardDetail,
  TrelloCardDetail,
  TrelloSearchResult,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMockTrelloClient } from '../src/parts/MockTrelloClient/MockTrelloClient.ts'
import {
  createMemoryRecentBoardStorage,
  type RecentBoardView,
} from '../src/parts/RecentBoardStorage/RecentBoardStorage.ts'
import {
  resetTrelloViewDependencyFactory,
  setTrelloViewDependencyFactory,
  view,
} from '../src/parts/TrelloView/TrelloView.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'

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

const hasNode = (
  dom: readonly any[],
  predicate: (node: any) => boolean,
): boolean => {
  return dom.some(predicate)
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
): Promise<VirtualDomViewInstance> => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({
      boards,
    }),
    recentStorage: createMemoryRecentBoardStorage(recentBoardViews),
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

interface SearchInstanceData {
  readonly boardDetails?: Readonly<Record<string, TrelloBoardDetail>>
  readonly boards?: readonly TrelloBoard[]
  readonly cardDetails?: Readonly<Record<string, TrelloCardDetail>>
  readonly searchError?: string
  readonly searchResults?: readonly TrelloSearchResult[]
}

const createSearchEnabledInstance = async (
  data: Readonly<SearchInstanceData>,
): Promise<VirtualDomViewInstance> => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient(data),
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

test('connect loads boards and clicking board loads detail', async () => {
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
  expect(detailText).toContain('Todo')
  expect(detailText).toContain('Ship Trello view')
  expect(detailClassNames).toContain('TrelloLists')
  expect(detailClassNames).toContain('TrelloList')
  expect(detailClassNames).toContain('TrelloCards')
  expect(hasDirectChildClass(detailDom, 'TrelloList', 'TrelloCards')).toBe(true)
  expect(hasDirectChildClass(detailDom, 'TrelloCards', 'TrelloCard')).toBe(true)
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
            name: 'Ship Trello view',
            url: 'https://trello.com/c/card-1',
          },
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
  expect(text).toContain('Open in Trello')
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailPanel')
  expect(getClassNames(detailDom)).toContain('TrelloCardDetailImage')
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
        node.className === 'TrelloCardDetailLink' &&
        node.href === 'https://trello.com/c/card-1'
      )
    }),
  ).toBe(true)
  expect(hasNode(detailDom, (node) => node.name === 'closeCardDetail')).toBe(
    true,
  )

  await instance.handleEvent?.({ name: 'closeCardDetail', type: 'click' })

  const closedDom = await instance.render()
  expect(getText(closedDom)).toContain('Todo')
  expect(getText(closedDom)).toContain('Ship Trello view')
  expect(getClassNames(closedDom)).not.toContain('TrelloCardDetailPanel')
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
    value: 'Updated title',
  })
  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Updated description',
  })
  await instance.handleEvent?.({ name: 'saveCardDetail', type: 'click' })

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
      return (
        node.name === 'cardDescription' && node.value === 'Updated description'
      )
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

test('connect shows validation error for invalid token shape', async () => {
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
    value: 'bad-token',
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('Token must be 64 alphanumeric characters.')
  expect(text).toContain('Token')
  expect(text).not.toContain('Roadmap')
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

  const text = getText(await instance.render())
  expect(text).toContain('Todo')
  expect(text).toContain('Found card')
  resetTrelloViewDependencyFactory()
})
