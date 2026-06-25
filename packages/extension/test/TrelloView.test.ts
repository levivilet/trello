import { expect, test } from '@jest/globals'
import type { VirtualDomViewInstance } from '@lvce-editor/api'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMockTrelloClient } from '../src/parts/MockTrelloClient/MockTrelloClient.ts'
import { resetTrelloViewDependencyFactory, setTrelloViewDependencyFactory, view } from '../src/parts/TrelloView/TrelloView.ts'

const getText = (dom: readonly any[]): string => {
  return dom
    .filter((node) => typeof node.text === 'string')
    .map((node) => node.text)
    .join('\n')
}

test('renders auth inputs when unauthenticated', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  const dom = await instance.render()

  expect(getText(dom)).toContain('API key')
  expect(getText(dom)).toContain('Token')
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
  await instance.handleEvent?.({ name: 'apiKey', type: 'input', value: 'key' })
  await instance.handleEvent?.({ name: 'token', type: 'input', value: 'token' })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain('Roadmap')

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const detailText = getText(await instance.render())
  expect(detailText).toContain('Todo')
  expect(detailText).toContain('Ship Trello view')
  resetTrelloViewDependencyFactory()
})

test('connect shows validation error for missing credentials', async () => {
  setTrelloViewDependencyFactory(() => ({
    client: createMockTrelloClient({}),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain('Enter an API key and token.')
  resetTrelloViewDependencyFactory()
})
