// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/prefer-readonly-parameter-types */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.board-detail-one-card'

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

const openBoard = async (Locator, expect, boardId = 'board-1') => {
  const board = Locator(`button[name="board:${boardId}"]`)
  await expect(board).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await board.click()
}

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const cardData = createCards(1)
  const lists = [createList('list-1', 'Todo', cardData)]
  await useMockDataAndShowTrello(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], lists),
    }),
  )
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)

  const cards = Locator('.TrelloCard')
  const firstCard = Locator('text=Card 1')

  await expect(cards).toHaveCount(1)
  await expect(firstCard).toBeVisible()
}
