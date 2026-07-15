import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  openCard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.card-comment-cancel'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const card = { id: 'card-1', name: 'Plan work' }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowTrello(Command, {
    ...createMockData(boards, boardDetails),
    cardDetails: {
      'card-1': {
        attachments: [],
        card,
        comments: [],
      },
    },
  })
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)
  await openCard(Locator, expect)

  const emptyComments = Locator('text=No comments')
  const writeComment = Locator('button[name="startWriteComment"]')
  await expect(emptyComments).toBeVisible()
  await expect(writeComment).toBeVisible()

  // eslint-disable-next-line e2e/no-direct-click
  await writeComment.click()

  const comment = Locator('textarea[name="cardComment"]')
  const save = Locator('button[name="submitComment"]')
  const cancel = Locator('button[name="cancelWriteComment"]')
  await expect(comment).toBeVisible()
  await expect(comment).toBeFocused()
  await expect(save).toBeVisible()
  await expect(cancel).toBeVisible()

  // eslint-disable-next-line e2e/no-direct-click
  await cancel.click()

  await expect(comment).toHaveCount(0)
  await expect(writeComment).toBeVisible()
  await expect(emptyComments).toBeVisible()
}
