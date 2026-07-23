import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardDescriptionCancelButton = (
  disabled: boolean,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDetailCancelButton',
      ),
      disabled,
      name: 'cancelCardDescriptionEdit',
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown:
        DomEventListenerFunctions.HandleCardDescriptionCancelPointerDown,
      type: VirtualDomElements.Button,
    },
    text(TrelloStrings.cancel()),
  ]
}
