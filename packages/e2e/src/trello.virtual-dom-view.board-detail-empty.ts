import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createMockData,
  openBoard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.board-detail-empty'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowTrello(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], []),
    }),
  )
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)

  const boardDetail = Locator('.TrelloBoardDetail')
  const lists = Locator('.TrelloList')
  const cards = Locator('.TrelloCard')

  await expect(boardDetail).toBeVisible()
  await expect(lists).toHaveCount(0)
  await expect(cards).toHaveCount(0)
}
