import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { hasCardLabel } from '../HasCardLabel/HasCardLabel.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'

export const renderCardLabelChoice = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
  label: Readonly<TrelloLabel>,
): readonly VirtualDomNode[] => {
  const { addingCardLabelId } = state
  const checked = hasCardLabel(labels, label.id)
  return [
    {
      childCount: 2,
      className: 'TrelloCardLabelChoice',
      disabled: Boolean(addingCardLabelId),
      name: `addCardLabel:${label.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    {
      checked,
      childCount: 0,
      className: 'TrelloCardLabelChoiceCheckbox',
      inputType: 'checkbox',
      name: `cardLabelCheckbox:${label.id}`,
      tabIndex: -1,
      type: VirtualDomElements.Input,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabelChoiceText',
        getLabelColorClassName(label.color),
      ),
      type: VirtualDomElements.Span,
    },
    text(getLabelText(label)),
  ]
}
