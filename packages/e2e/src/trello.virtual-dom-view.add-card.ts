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

export const test: Test = async ({ Command, expect, KeyBoard, Locator }) => {
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

  const title = Locator('textarea[name="newCardTitle:list-1"]')
  const submit = Locator('button[name="submitAddCard:list-1"]')
  const close = Locator('button[name="cancelAddCard"]')
  await expect(title).toBeVisible()
  await expect(submit).toBeVisible()
  await expect(close).toBeVisible()
  await expect(title).toHaveAttribute('rows', '2')
  await expect(title).toHaveCSS('field-sizing', 'content')
  await expect(title).toHaveCSS('height', '56px')

  await title.type('abc')
  await expect(title).toBeFocused()
  await KeyBoard.press('Escape')
  await expect(title).toHaveCount(0)

  const addCardInOtherList = Locator('button[name="addCard:list-2"]')
  await expect(addCardInOtherList).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await addCardInOtherList.click()
  const titleInOtherList = Locator('textarea[name="newCardTitle:list-2"]')
  await expect(titleInOtherList).toHaveValue('abc')

  await Command.executeExtensionCommand('trello.test.blurNewCard', 'list-2')
  await expect(titleInOtherList).toHaveCount(0)

  const addCardAgain = Locator('button[name="addCard:list-1"]')
  await expect(addCardAgain).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await addCardAgain.click()
  await expect(title).toHaveValue('abc')

  await title.type('W'.repeat(47))

  await expect(title).toHaveCSS('height', '76px')

  // eslint-disable-next-line e2e/no-direct-click
  await close.click()
  await expect(title).toHaveCount(0)
}
