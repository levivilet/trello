import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewState } from '../state/TrelloViewState.ts'

export const handleInputEvent = (
  state: Readonly<TrelloViewState>,
  event: Readonly<ViewEvent>,
): void => {
  const mutableState = state as TrelloViewState
  if (event.name === 'apiKey') {
    mutableState.draftApiKey =
      typeof event.value === 'string' ? event.value : ''
    return
  }
  if (event.name === 'token') {
    mutableState.draftToken = typeof event.value === 'string' ? event.value : ''
    return
  }
  if (event.name === 'search') {
    mutableState.draftSearchQuery =
      typeof event.value === 'string' ? event.value : ''
    return
  }
  if (event.name === 'cardTitle') {
    mutableState.draftCardTitle =
      typeof event.value === 'string' ? event.value : ''
    return
  }
  if (event.name === 'cardDescription') {
    mutableState.draftCardDescription =
      typeof event.value === 'string' ? event.value : ''
  }
}
