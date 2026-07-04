import type { ViewEvent } from '@lvce-editor/api'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { updateBoardDetailList } from './UpdateBoardDetailList.ts'

const listTitlePrefix = 'listTitle:'

export const handleBlurEvent = async (
  context: Readonly<TrelloViewActionContext>,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (!event.name?.startsWith(listTitlePrefix)) {
    return
  }
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (!state.credentials || !state.boardDetail) {
    return
  }
  const listId = event.name.slice(listTitlePrefix.length)
  const list = state.boardDetail.lists.find((item) => {
    return item.id === listId
  })
  if (!list) {
    return
  }
  const draft = state.draftListTitles[listId] ?? list.name
  const name = draft.trim()
  if (!name) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    state.error = 'List title is required.'
    requestRerender()
    return
  }
  if (name === list.name) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    return
  }
  state.error = ''
  try {
    const updatedList = await client.updateList(
      list,
      {
        name,
      },
      state.credentials,
    )
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: updatedList.name,
    }
    updateBoardDetailList(state, updatedList)
  } catch (error) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    state.error = getErrorMessage(error)
  }
  requestRerender()
}
