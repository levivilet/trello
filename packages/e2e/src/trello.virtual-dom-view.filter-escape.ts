import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-escape'

export const test: Test = async ({ Command, expect, KeyBoard, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ Command, expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  const cards = Locator('.TrelloCard')
  const popup = Locator('.TrelloBoardFilterPopup')
  await input.type('blocked')
  await Command.execute('Timeout.sleep', 100)
  await expect(cards).toHaveCount(1)

  await KeyBoard.press('Escape')
  await Command.execute('Timeout.sleep', 100)

  await expect(popup).toHaveCount(0)
  await expect(cards).toHaveCount(1)
  await openBoardFilter({ Command, expect, Locator })
  await expect(input).toHaveValue('blocked')
}
