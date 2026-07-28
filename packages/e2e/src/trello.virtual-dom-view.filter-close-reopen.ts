import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-close-reopen'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  const cards = Locator('.TrelloCard')
  const popup = Locator('.TrelloBoardFilterPopup')
  await input.type('ready')
  await expect(cards).toHaveCount(1)

  const close = Locator('button[name="closeBoardFilter"]')
  // eslint-disable-next-line e2e/no-direct-click
  await close.click()

  await expect(popup).toHaveCount(0)
  await expect(cards).toHaveCount(1)

  await openBoardFilter({ expect, Locator })
  await expect(input).toHaveValue('ready')
  await expect(input).toBeFocused()
}
