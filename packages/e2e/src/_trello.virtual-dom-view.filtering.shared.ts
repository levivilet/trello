import type { TestApi } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const showFilteringBoard = async ({
  Command,
  expect,
  Locator,
}: Readonly<
  Pick<TestApi, 'Command' | 'expect' | 'Locator'>
>): Promise<void> => {
  const boards = createBoards(1)
  const lists = [
    createList('list-1', 'Todo', [
      {
        id: 'card-title',
        name: 'Implement filtering',
      },
      {
        desc: 'Deploy the Trello extension to production',
        id: 'card-description',
        name: 'Release extension',
      },
      {
        id: 'card-label',
        labels: [
          {
            color: 'green',
            id: 'label-ready',
            name: 'Ready for review',
          },
        ],
        name: 'Review changes',
      },
    ]),
    createList('list-2', 'Done', [
      {
        desc: 'Waiting for an upstream dependency',
        id: 'card-blocked',
        labels: [
          {
            color: 'red',
            id: 'label-blocked',
            name: 'Blocked',
          },
        ],
        name: 'Update dependencies',
      },
      {
        id: 'card-documentation',
        name: 'Write documentation',
      },
    ]),
  ]
  await useMockDataAndShowTrello(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], lists),
    }),
  )
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)
}

export const openBoardFilter = async ({
  Command,
  expect,
  Locator,
}: Readonly<
  Pick<TestApi, 'Command' | 'expect' | 'Locator'>
>): Promise<void> => {
  const openFilter = Locator('button[name="openBoardFilter"]')
  await expect(openFilter).toBeVisible()
  await expect(openFilter).toHaveAttribute('aria-expanded', 'false')
  await expect(openFilter).toHaveAttribute('title', 'Filter cards')
  // eslint-disable-next-line e2e/no-direct-click
  await openFilter.click()
  await Command.execute('Timeout.sleep', 100)

  const popup = Locator('.TrelloBoardFilterPopup')
  const input = Locator('input[name="boardFilter"]')
  await expect(openFilter).toHaveAttribute('aria-expanded', 'true')
  await expect(popup).toBeVisible()
  await expect(input).toBeFocused()
}
