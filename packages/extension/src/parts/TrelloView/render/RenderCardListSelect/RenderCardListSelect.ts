import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TrelloCard } from '../../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import type { VirtualDomSegment } from '../VirtualDomSegment/VirtualDomSegment.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { getCardListId } from '../GetCardListId/GetCardListId.ts'
import { renderCardListOption } from '../RenderCardListOption/RenderCardListOption.ts'

export const renderCardListSelect = (
  state: Readonly<TrelloViewState>,
  card: Readonly<TrelloCard>,
): VirtualDomSegment => {
  const { boardDetail, movingCardId } = state
  const lists = boardDetail?.lists || []
  if (lists.length === 0) {
    return { childCount: 0, dom: [] }
  }
  const selectedListId = getCardListId(state, card)
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'TrelloCardListSection',
        type: VirtualDomElements.Div,
      },
      {
        childCount: 1,
        className: 'TrelloCardListLabel',
        type: VirtualDomElements.Label,
      },
      text(TrelloStrings.list()),
      {
        childCount: lists.length,
        className: MergeClassNames.mergeClassNames(
          'TrelloInput',
          'TrelloCardListSelect',
        ),
        disabled: movingCardId === card.id,
        name: `cardList:${card.id}`,
        onInput: DomEventListenerFunctions.HandleInput,
        type: VirtualDomElements.Select,
        value: selectedListId,
      },
      ...lists.flatMap((list) => renderCardListOption(list, selectedListId)),
    ],
  }
}
