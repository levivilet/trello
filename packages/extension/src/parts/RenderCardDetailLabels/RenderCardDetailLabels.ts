import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardDetailLabel } from '../RenderCardDetailLabel/RenderCardDetailLabel.ts'
import { renderCardLabelPicker } from '../RenderCardLabelPicker/RenderCardLabelPicker.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const renderLabels = (
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  if (!labels || labels.length === 0) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'TrelloButton',
          'TrelloCardLabelAddButton',
        ),
        name: 'openCardLabelPicker',
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(TrelloStrings.labels()),
    ]
  }
  return [
    {
      childCount: 2,
      className: 'TrelloCardLabelRow',
      type: VirtualDomElements.Div,
    },
    {
      childCount: labels.length,
      className: 'TrelloCardLabels',
      type: VirtualDomElements.Div,
    },
    ...labels.flatMap(renderCardDetailLabel),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardLabelAddIconButton',
      ),
      name: 'openCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('+'),
  ]
}

const renderLabelPicker = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  if (!cardLabelPickerOpen) {
    return []
  }
  return renderCardLabelPicker(state, labels)
}

export const renderCardDetailLabels = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  return [
    {
      childCount: 1 + (cardLabelPickerOpen ? 1 : 0),
      className: 'TrelloCardLabelSection',
      type: VirtualDomElements.Div,
    },
    ...renderLabels(labels),
    ...renderLabelPicker(state, labels),
  ]
}
