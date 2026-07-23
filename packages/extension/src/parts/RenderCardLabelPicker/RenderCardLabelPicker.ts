import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardLabelCreate } from '../RenderCardLabelCreate/RenderCardLabelCreate.ts'
import { renderCardLabelPickerContent } from '../RenderCardLabelPickerContent/RenderCardLabelPickerContent.ts'
import { renderCardLabelPickerHeader } from '../RenderCardLabelPickerHeader/RenderCardLabelPickerHeader.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardLabelPicker = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelCreateOpen, draftLabelSearchQuery } = state
  if (cardLabelCreateOpen) {
    return [
      {
        childCount: 1,
        className: 'TrelloCardLabelPicker',
        name: 'cardLabelPicker',
        onPointerDown:
          DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
        type: VirtualDomElements.Div,
      },
      ...renderCardLabelCreate(state),
    ]
  }
  return [
    {
      childCount: 3,
      className: 'TrelloCardLabelPicker',
      name: 'cardLabelPicker',
      onPointerDown: DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelPickerHeader(),
    {
      autocomplete: 'off',
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloInput',
        'TrelloCardLabelSearchInput',
      ),
      name: 'cardLabelSearch',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: TrelloStrings.searchLabels(),
      type: VirtualDomElements.Input,
      value: draftLabelSearchQuery,
    },
    ...renderCardLabelPickerContent(state, labels),
  ]
}
