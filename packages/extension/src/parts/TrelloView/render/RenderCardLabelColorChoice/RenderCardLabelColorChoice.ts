import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { getLabelColorClassName } from '../../LabelHelpers.ts'

export const renderCardLabelColorChoice = (
  state: Readonly<TrelloViewState>,
  color: string,
): VirtualDomNode => {
  const { draftNewLabelColor, savingNewLabel } = state
  const selected = draftNewLabelColor === color
  const colorClassName = getLabelColorClassName(color)
  const colorLabel = TrelloStrings.selectLabelColor(color.replace('_', ' '))
  return {
    'aria-label': colorLabel,
    'aria-pressed': selected,
    childCount: 0,
    className: selected
      ? MergeClassNames.mergeClassNames(
          'TrelloCardLabelColorChoice',
          colorClassName,
          'TrelloCardLabelColorChoiceSelected',
        )
      : MergeClassNames.mergeClassNames(
          'TrelloCardLabelColorChoice',
          colorClassName,
        ),
    disabled: savingNewLabel,
    name: `selectCardLabelColor:${color}`,
    onClick: DomEventListenerFunctions.HandleClick,
    title: colorLabel,
    type: VirtualDomElements.Button,
  }
}
