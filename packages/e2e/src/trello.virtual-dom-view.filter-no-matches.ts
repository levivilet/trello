import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-no-matches'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  await Locator('input[name="boardFilter"]').type('no such card')

  const cards = Locator('.TrelloCard')
  const lists = Locator('.TrelloList')
  const noCards = Locator('text=No cards')
  const counts = Locator('.TrelloListCardCount')
  const firstCount = counts.nth(0)
  const secondCount = counts.nth(1)
  await expect(cards).toHaveCount(0)
  await expect(lists).toHaveCount(2)
  await expect(noCards).toHaveCount(2)
  await expect(firstCount).toHaveText('0')
  await expect(secondCount).toHaveText('0')
}
