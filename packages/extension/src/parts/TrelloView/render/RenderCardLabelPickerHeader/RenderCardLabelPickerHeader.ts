import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'

export const renderCardLabelPickerHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardLabelPickerHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloCardLabelPickerTitle',
      type: VirtualDomElements.Div,
    },
    text('Labels'),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardLabelPickerCloseButton',
      ),
      name: 'closeCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}
