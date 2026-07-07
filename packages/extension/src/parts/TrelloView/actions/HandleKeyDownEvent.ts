import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewActionContext } from '../state/TrelloViewState.ts'
import { cancelAddCard } from './AddCard.ts'
import { cancelAddList } from './AddList.ts'

const getEventString = (event: Readonly<ViewEvent>, key: string): string => {
  const value = (event as unknown as Readonly<Record<string, unknown>>)[key]
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export const handleKeyDownEvent = (
  context: TrelloViewActionContext,
  event: Readonly<ViewEvent>,
): void => {
  const key = getEventString(event, 'key') || getEventString(event, 'code')
  if (key !== 'Escape') {
    return
  }
  if (event.name?.startsWith('newCardTitle:')) {
    cancelAddCard(context)
    return
  }
  if (event.name === 'newListTitle') {
    cancelAddList(context)
  }
}
