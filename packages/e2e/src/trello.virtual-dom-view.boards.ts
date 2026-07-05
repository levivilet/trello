import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.boards'
export const skip = true

export const test: Test = async ({ Main, Command, expect, Locator }) => {
  await Main.closeAllEditors()
  const boards = createBoards(1)
  await useMockDataAndShowTrello(Command, createMockData(boards))
  await connectWithCredentials({ expect, Locator })

  const board = Locator('button[name="board:board-1"]')
  await expect(board).toBeVisible()

  const roadmap = Locator('text=Roadmap')

  await expect(roadmap).toBeVisible()
}
