import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.add-card-blur-preserves-draft'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const listsData = [
    createList('list-1', 'Todo', []),
    createList('list-2', 'Doing', []),
  ]
  await useMockDataAndShowTrello(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], listsData),
    }),
  )
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)

  const addCard = Locator('button[name="addCard:list-1"]')
  // eslint-disable-next-line e2e/no-direct-click
  await addCard.click()

  const title = Locator('textarea[name="newCardTitle:list-1"]')
  await title.type('abc')
  // eslint-disable-next-line e2e/no-direct-click
  await Locator('input[name="listTitle:list-1"]').click()
  await expect(title).toHaveCount(0)

  const addCardInOtherList = Locator('button[name="addCard:list-2"]')
  // eslint-disable-next-line e2e/no-direct-click
  await addCardInOtherList.click()
  const titleInOtherList = Locator('textarea[name="newCardTitle:list-2"]')
  await expect(titleInOtherList).toHaveValue('abc')
}
