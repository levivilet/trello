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

export const name = 'trello.virtual-dom-view.card-label-picker'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const card = { id: 'card-1', labels: [], name: 'Plan work' }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowTrello(Command, {
    ...createMockData(boards, boardDetails),
    boardLabels: {
      'board-1': [
        { color: 'green', id: 'label-1', name: 'Ready' },
        { color: 'yellow', id: 'label-2', name: 'Needs review' },
      ],
    },
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

  const openPicker = Locator('button[name="openCardLabelPicker"]')
  await expect(openPicker).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await openPicker.click()

  const picker = Locator('[name="cardLabelPicker"]')
  const search = Locator('input[name="cardLabelSearch"]')
  const ready = Locator('button[name="addCardLabel:label-1"]')
  const needsReview = Locator('button[name="addCardLabel:label-2"]')
  const closePicker = Locator('button[name="closeCardLabelPicker"]')
  await expect(picker).toBeVisible()
  await expect(search).toBeFocused()
  await expect(ready).toHaveText('Ready')
  await expect(needsReview).toHaveText('Needs review')
  await expect(closePicker).toBeVisible()

  // eslint-disable-next-line e2e/no-direct-click
  await closePicker.click()

  await expect(picker).toHaveCount(0)
  await expect(openPicker).toBeVisible()
}
