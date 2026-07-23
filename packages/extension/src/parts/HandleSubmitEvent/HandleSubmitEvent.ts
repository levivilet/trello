import type { ViewEvent } from '@lvce-editor/api'
import type { TrelloViewActionContext } from '../TrelloViewState/TrelloViewState.ts'
import { submitAddCard } from '../AddCard/AddCard.ts'
import { submitAddList } from '../AddList/AddList.ts'
import { submitSearch } from '../SubmitSearch/SubmitSearch.ts'

export const handleSubmitEvent = async (
  context: TrelloViewActionContext,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (event.name === 'search') {
    await submitSearch(context)
    return
  }
  if (await submitAddList(context, event.name)) {
    return
  }
  await submitAddCard(context, event.name)
}
