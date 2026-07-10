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

export const name = 'trello.virtual-dom-view.add-card'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const listsData = [
    createList('list-1', 'Todo', [{ id: 'card-1', name: 'Plan work' }]),
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
  await expect(addCard).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await addCard.click()

  const title = Locator('input[name="newCardTitle:list-1"]')
  await expect(title).toBeVisible()
  await title.type('Build add card\n')

  const todoList = Locator('.TrelloList[name="list:list-1"]')
  const doingList = Locator('.TrelloList[name="list:list-2"]')
  await expect(todoList.locator('text=Build add card')).toBeVisible()
  await expect(doingList.locator('text=Build add card')).toHaveCount(0)
  await expect(title).toBeVisible()
  await expect(title).toHaveValue('')
  await expect(title).toBeFocused()
  await title.type('Write tests\n')
  await expect(todoList.locator('text=Write tests')).toBeVisible()
  await expect(title).toHaveValue('')
  await expect(title).toBeFocused()
}
