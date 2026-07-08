// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/prefer-readonly-parameter-types */
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.list-create'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  // arrange

  // act
  await Command.executeExtensionCommand('trello.openMockBoard', {
    id: 'abc',
    name: 'abc',
  })

  // assert
  // const list = Locator('[name="listTitle:created-list-1"]')
  // await expect(list).toBeVisible()
}
