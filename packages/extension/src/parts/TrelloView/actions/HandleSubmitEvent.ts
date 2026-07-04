import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewActionContext } from '../state/TrelloViewState.ts'
import { submitSearch } from './SubmitSearch.ts'

export const handleSubmitEvent = async (
  context: TrelloViewActionContext,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (event.name === 'search') {
    await submitSearch(context)
  }
}
