import { activate as activateExtensionApi, registerCommand, registerView } from '@lvce-editor/api'
import { createMemoryCredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import { createMockTrelloClient, type MockTrelloData } from '../MockTrelloClient/MockTrelloClient.ts'
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
    id: 'trello.test.useMockData',
    execute(data: MockTrelloData) {
      TrelloView.setTrelloViewDependencyFactory(() => ({
        client: createMockTrelloClient(data),
        storage: createMemoryCredentialStorage(),
      }))
    },
  })
  registerCommand({
    id: 'trello.test.reset',
    execute() {
      TrelloView.resetTrelloViewDependencyFactory()
    },
  })
}

export const deactivate = (): void => {}
