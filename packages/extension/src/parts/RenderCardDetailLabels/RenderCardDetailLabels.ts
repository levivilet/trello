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

export const renderCardDetailLabels = (
  state: Readonly<TrelloViewState>,
  labels: readonly TrelloLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  const hasLabels = Boolean(labels && labels.length > 0)
  return [
    {
      childCount: 1 + (cardLabelPickerOpen ? 1 : 0),
      className: 'TrelloCardLabelSection',
      type: VirtualDomElements.Div,
    },
    ...(hasLabels
      ? [
          {
            childCount: 2,
            className: 'TrelloCardLabelRow',
            type: VirtualDomElements.Div,
          },
          {
            childCount: labels!.length,
            className: 'TrelloCardLabels',
            type: VirtualDomElements.Div,
          },
          ...labels!.flatMap(renderCardDetailLabel),
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
      : [
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
        ]),
    ...(cardLabelPickerOpen ? renderCardLabelPicker(state, labels) : []),
  ]
}
