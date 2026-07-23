import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloLabel } from '../../../TrelloTypes/TrelloTypes.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import { getLabelColorClassName, getLabelText } from '../../LabelHelpers.ts'

export const renderCardDetailLabel = (
  label: Readonly<TrelloLabel>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabel',
        'TrelloCardLabelButton',
        getLabelColorClassName(label.color),
      ),
      name: 'openCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(getLabelText(label)),
  ]
}
