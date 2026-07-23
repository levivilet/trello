import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'

export const renderCardDescriptionHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'TrelloCardDetailSectionTitle',
      type: VirtualDomElements.H3,
    },
    text(TrelloStrings.description()),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDescriptionEditButton',
      ),
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(TrelloStrings.edit()),
  ]
}
