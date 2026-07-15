import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  openCard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.card-detail-close'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const card = { id: 'card-1', name: 'Plan work' }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowTrello(Command, createMockData(boards, boardDetails))
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)
  await openCard(Locator, expect)

  const panel = Locator('[name="cardDetail"]')
  const title = Locator('textarea[name="cardTitle"]')
  const close = Locator('button[name="closeCardDetail"]')
  const cardButton = Locator('button[name="card:card-1"]')
  await expect(panel).toBeVisible()
  await expect(title).toHaveValue('Plan work')
  await expect(close).toBeVisible()

  // eslint-disable-next-line e2e/no-direct-click
  await close.click()

  await expect(panel).toHaveCount(0)
  await expect(title).toHaveCount(0)
  await expect(cardButton).toBeVisible()
}
