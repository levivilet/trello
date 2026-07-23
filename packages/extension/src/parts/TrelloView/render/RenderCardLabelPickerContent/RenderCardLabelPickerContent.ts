import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloLabel } from '../../../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { getMatchingLabels } from '../GetMatchingLabels/GetMatchingLabels.ts'
import { renderCardLabelChoice } from '../RenderCardLabelChoice/RenderCardLabelChoice.ts'

export const renderCardLabelPickerContent = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { boardLabelsLoading, draftLabelSearchQuery } = state
  if (boardLabelsLoading) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.loadingLabels()),
    ]
  }
  const matchingLabels = getMatchingLabels(state)
  if (matchingLabels.length === 0) {
    if (draftLabelSearchQuery.trim()) {
      return [
        {
          childCount: 1,
          className: MergeClassNames.mergeClassNames(
            'TrelloButton',
            'TrelloCardLabelCreateButton',
          ),
          name: 'openCardLabelCreate',
          onClick: DomEventListenerFunctions.HandleClick,
          type: VirtualDomElements.Button,
        },
        text(TrelloStrings.createNewLabel()),
      ]
    }
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.noLabelsAvailable()),
    ]
  }
  return [
    {
      childCount: matchingLabels.length,
      className: 'TrelloCardLabelPickerList',
      type: VirtualDomElements.Div,
    },
    ...matchingLabels.flatMap((label) =>
      renderCardLabelChoice(state, labels, label),
    ),
  ]
}
