import type { VirtualDomViewInstance } from '@lvce-editor/api'
import { expect, test } from '@jest/globals'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMockTrelloClient } from '../src/parts/MockTrelloClient/MockTrelloClient.ts'
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

test('renders auth inputs when unauthenticated', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
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

test('connect shows validation error for missing credentials', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
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
