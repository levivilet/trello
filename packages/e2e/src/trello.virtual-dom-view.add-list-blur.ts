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

export const name = 'trello.virtual-dom-view.add-list-blur'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const lists = [createList('list-1', 'Todo', [])]
  await useMockDataAndShowTrello(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], lists),
    }),
  )
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)

  const addList = Locator('button[name="startAddList"]')
  await expect(addList).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await addList.click()

  const newListTitle = Locator('input[name="newListTitle"]')
  await expect(newListTitle).toBeVisible()
  await expect(newListTitle).toBeFocused()

  await newListTitle.dispatchEvent('blur', '{}')

  await expect(newListTitle).toHaveCount(0)
  await expect(addList).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await addList.click()
  await expect(newListTitle).toBeVisible()
  await expect(newListTitle).toBeFocused()
}
