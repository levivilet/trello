import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.credentials'

export const skip = true

const mockData = {
  boardDetails: {
    'board-1': {
      board: {
        id: 'board-1',
        name: 'Roadmap',
      },
      lists: [
        {
          cards: [
            {
              id: 'card-1',
              name: 'Ship Trello view',
            },
          ],
          id: 'list-1',
          name: 'Todo',
        },
      ],
    },
  },
  boards: [
    {
      id: 'board-1',
      name: 'Roadmap',
    },
  ],
}

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.executeExtensionCommand('trello.test.useMockData', mockData)
  await Command.executeExtensionCommand('trello.show')

  const apiKeyInput = Locator('input[name="apiKey"]')
  const tokenInput = Locator('input[name="token"]')
  await expect(apiKeyInput).toBeVisible()
  await expect(tokenInput).toBeVisible()

  const apiKey = Locator('text=API key')
  const token = Locator('text=Token')

  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
}
