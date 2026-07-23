import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-whitespace'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  await Locator('input[name="boardFilter"]').type(' '.repeat(3))

  const cards = Locator('.TrelloCard')
  await expect(cards).toHaveCount(5)
  const counts = Locator('.TrelloListCardCount')
  const firstCount = counts.nth(0)
  const secondCount = counts.nth(1)
  await expect(firstCount).toHaveText('3')
  await expect(secondCount).toHaveText('2')
}
