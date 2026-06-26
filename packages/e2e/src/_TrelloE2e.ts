import type { Test } from '@lvce-editor/test-with-playwright'

type TestContext = Parameters<Test>[0]

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
}: TestContext): Promise<void> => {
  await Command.executeExtensionCommand('trello.test.useMockData', mockData)
  await Command.executeExtensionCommand('trello.show')

  await expect(Locator('input[name="apiKey"]')).toBeVisible()
  await expect(Locator('input[name="token"]')).toBeVisible()
}

export const connectToMockTrello = async (
  context: TestContext,
): Promise<void> => {
  const { expect, Locator } = context

  await openMockTrelloView(context)
  await Locator('input[name="apiKey"]').type('key')
  await Locator('input[name="token"]').type('token')
  await Locator('button[name="connect"]').click()

  await expect(Locator('button[name="board:board-1"]')).toBeVisible()
}

export const selectBoard = async (
  { expect, Locator }: TestContext,
  boardId: string,
): Promise<void> => {
  const board = Locator(`button[name="board:${boardId}"]`)
  await expect(board).toBeVisible()
  await board.click()
}
