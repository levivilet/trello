import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-open'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  const popup = Locator('.TrelloBoardFilterPopup')
  const input = Locator('input[name="boardFilter"]')
  const close = Locator('button[name="closeBoardFilter"]')
  await expect(popup).toBeVisible()
  await expect(input).toHaveValue('')
  await expect(close).toBeVisible()
}
