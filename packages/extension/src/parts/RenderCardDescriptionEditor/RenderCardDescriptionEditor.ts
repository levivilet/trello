import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardDescriptionCancelButton } from '../RenderCardDescriptionCancelButton/RenderCardDescriptionCancelButton.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardDescriptionEditor = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardDescription, savingCardDetail } = state
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionEditor',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloTextArea',
        'TrelloCardDescriptionTextArea',
      ),
      name: 'cardDescription',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: TrelloStrings.addDetailedDescription(),
      type: VirtualDomElements.TextArea,
      value: draftCardDescription,
    },
    {
      childCount: 2,
      className: 'TrelloCardDetailActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardDetailSaveButton',
      ),
      name: 'saveCardDetail',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingCardDetail ? TrelloStrings.saving() : TrelloStrings.save()),
    ...renderCardDescriptionCancelButton(savingCardDetail),
  ]
}
