import type { Test } from '@lvce-editor/test-with-playwright'

type TestContext = Pick<Parameters<Test>[0], 'Locator' | 'expect'>
type MockTestContext = Pick<
  Parameters<Test>[0],
  'Command' | 'Locator' | 'expect'
>

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

export const openMockTrelloView = async ({
  Command,
  expect,
  Locator,
}: MockTestContext): Promise<void> => {
  await Command.executeExtensionCommand('trello.test.useMockData', mockData)
  await Command.executeExtensionCommand('trello.show')

  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
}

export const connectToMockTrello = async ({
  Command,
  expect,
  Locator,
}: MockTestContext): Promise<void> => {
  await openMockTrelloView({ Command, expect, Locator })
  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  await apiKey.type('key')
  await token.type('token')
  const connect = Locator('button[name="connect"]')
  // eslint-disable-next-line e2e/no-direct-click
  await connect.click()

  const board = Locator('button[name="board:board-1"]')
  await expect(board).toBeVisible()
}

export const selectBoard = async (
  { expect, Locator }: TestContext,
  boardId: string,
): Promise<void> => {
  const board = Locator(`button[name="board:${boardId}"]`)
  await expect(board).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await board.click()
}
