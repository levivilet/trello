import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.refresh-boards'
export const skip = true

const createBoards = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `board-${number}`,
      name: number === 1 ? 'Roadmap' : `Board ${number}`,
    }
  })
}

const useMockDataAndShowTrello = async (Command, mockData) => {
  await Command.executeExtensionCommand('trello.test.useMockData', mockData)
  await Command.executeExtensionCommand('trello.show')
}

const connectWithCredentials = async ({ expect, Locator }) => {
  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
  await apiKey.type('key')
  await token.type('token')
  const connect = Locator('button[name="connect"]')
  await expect(connect).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await connect.click()
}

export const test: Test = async ({ Command, expect, Locator }) => {
  const firstBoards = createBoards(1)
  const refreshedBoards = [
    {
      id: 'board-2',
      name: 'Board 2',
    },
  ]
  await useMockDataAndShowTrello(Command, {
    boards: refreshedBoards,
    listBoardsResponses: [firstBoards, refreshedBoards],
  })
  await connectWithCredentials({ expect, Locator })

  const firstBoard = Locator('button[name="board:board-1"]')
  await expect(firstBoard).toBeVisible()

  const refresh = Locator('button[name="refreshBoards"]')
  await expect(refresh).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await refresh.click()

  const refreshedBoard = Locator('button[name="board:board-2"]')
  await expect(refreshedBoard).toBeVisible()
  await expect(firstBoard).not.toBeVisible()
}
