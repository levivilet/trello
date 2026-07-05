import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewState } from '../state/TrelloViewState.ts'

export const handleInputEvent = (
  state: Readonly<TrelloViewState>,
  event: Readonly<ViewEvent>,
): void => {
  const mutableState = state as TrelloViewState
  const value = typeof event.value === 'string' ? event.value : ''
  if (event.name?.startsWith('newCardTitle:')) {
    mutableState.draftNewCardTitle = value
    return
  }
  switch (event.name) {
    case 'apiKey':
      mutableState.draftApiKey = value
      return
    case 'cardDescription':
      mutableState.draftCardDescription = value
      return
    case 'cardTitle':
      mutableState.draftCardTitle = value
      return
    case 'search':
      mutableState.draftSearchQuery = value
      return
    case 'token':
      mutableState.draftToken = value
      return
    default:
      if (event.name?.startsWith('listTitle:')) {
        const listId = event.name.slice('listTitle:'.length)
        mutableState.draftListTitles = {
          ...mutableState.draftListTitles,
          [listId]: value,
        }
      }
  }
}
