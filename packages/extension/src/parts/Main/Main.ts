import {
  activate as activateExtensionApi,
  executeCommand,
  registerCommand,
  registerView,
} from '@lvce-editor/api'
import { createMemoryCredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import {
  createMockTrelloClient,
  type MockTrelloData,
} from '../MockTrelloClient/MockTrelloClient.ts'
import * as TrelloView from '../TrelloView/TrelloView.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(TrelloView.view)
  registerCommand({
    execute() {
      return executeCommand('SideBar.show', TrelloView.viewId, true)
    },
    id: 'trello.show',
  })
  registerCommand({
    execute(data: Readonly<MockTrelloData>) {
      TrelloView.setTrelloViewDependencyFactory(() => ({
        client: createMockTrelloClient(data),
        storage: createMemoryCredentialStorage(),
      }))
      return { ok: true }
    },
    id: 'trello.test.useMockData',
  })
  registerCommand({
    execute() {
      TrelloView.resetTrelloViewDependencyFactory()
      return { ok: true }
    },
    id: 'trello.test.reset',
  })
}

export const deactivate = (): void => {}
