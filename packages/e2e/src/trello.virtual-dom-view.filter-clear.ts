import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-clear'

export const test: Test = async ({ Command, expect, KeyBoard, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  const cards = Locator('.TrelloCard')
  await input.type('ready')
  await expect(cards).toHaveCount(1)

  await KeyBoard.press('Control+a')
  await KeyBoard.press('Backspace')

  await expect(input).toHaveValue('')
  await expect(cards).toHaveCount(5)
  const counts = Locator('.TrelloListCardCount')
  const firstCount = counts.nth(0)
  const secondCount = counts.nth(1)
  await expect(firstCount).toHaveText('3')
  await expect(secondCount).toHaveText('2')
}
