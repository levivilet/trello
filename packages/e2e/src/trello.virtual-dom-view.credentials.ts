import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.credentials'
export const skip = true

const createCards = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `card-${number}`,
      name: `Card ${number}`,
    }
  })
}

const createList = (id, name, cards) => {
  return {
    cards,
    id,
    name,
  }
}

const createBoardDetail = (board, lists) => {
  return {
    board,
    lists,
  }
}

const createMockData = (
  boards,
  boardDetails = Object.fromEntries(
    boards.map((board) => [
      board.id,
      createBoardDetail(board, [createList('list-1', 'Todo', createCards(1))]),
    ]),
  ),
) => {
  return {
    boardDetails,
    boards,
  }
}

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

export const test: Test = async ({ Command, expect, Locator }) => {
  let step = 'start'
  try {
    step = 'create boards'
    const boards = createBoards(1)
    const mockData = createMockData(boards)
    step = 'reset'
    step = 'use mock data'
    await Command.executeExtensionCommand('trello.test.useMockData', mockData)
    step = 'show trello'
    await Command.executeExtensionCommand('trello.show')

    step = 'locate inputs'
    const apiKeyInput = Locator('input[name="apiKey"]')
    const tokenInput = Locator('input[name="token"]')
    step = 'expect inputs'
    await expect(apiKeyInput).toBeVisible()
    await expect(tokenInput).toBeVisible()

    step = 'locate labels'
    const apiKey = Locator('text=API key')
    const token = Locator('text=Token')

    step = 'expect labels'
    await expect(apiKey).toBeVisible()
    await expect(token).toBeVisible()
  } catch (error) {
    throw new Error(`credentials failed at ${step}: ${error}`)
  }
}
