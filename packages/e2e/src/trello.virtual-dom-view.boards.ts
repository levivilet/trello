import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.boards'

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

  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
  await apiKey.type('key')
  await token.type('token')
  const connect = Locator('button[name="connect"]')
  // eslint-disable-next-line e2e/no-direct-click
  await connect.click()

  const board = Locator('button[name="board:board-1"]')
  await expect(board).toBeVisible()

  const roadmap = Locator('text=Roadmap')

  await expect(roadmap).toBeVisible()
}
