import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.component-state'

interface ComponentInfo {
  readonly editable: boolean
  readonly moduleId: string
  readonly uid: number
}

export const test: Test = async ({ Command, expect, Locator }) => {
  await useMockDataAndShowTrello(Command, createMockData(createBoards(1)))
  await connectWithCredentials({ Command, expect, Locator })
  const boardButtons = Locator('.TrelloBoardButton')
  await expect(boardButtons).toHaveCount(1)
  const components = (await Command.execute(
    'ComponentState.getComponents',
  )) as readonly ComponentInfo[]
  const component = components.find((item) => item.moduleId === 'ExtensionView')
  if (!component?.editable) {
    throw new Error('Expected editable extension component state')
  }
  const state = await Command.execute('ComponentState.getState', component.uid)
  const { boards } = state
  if (boards.length !== 1) {
    throw new Error('Expected live Trello boards')
  }
  await Command.execute('ComponentState.setState', component.uid, {
    ...state,
    boards: [{ ...boards[0], name: 'Inspector board' }],
  })
  await expect(boardButtons).toHaveText('Inspector board')
  await Command.executeExtensionCommand('trello.refreshBoards')
  await expect(boardButtons).toHaveText('Roadmap')
  const updatedState = await Command.execute(
    'ComponentState.getState',
    component.uid,
  )
  if (updatedState.boards[0].name !== 'Roadmap') {
    throw new Error('Component state did not follow Trello refresh')
  }
}
