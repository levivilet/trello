import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import {
  getLabelColorClassName,
  labelColors,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardLabelColorChoice } from '../RenderCardLabelColorChoice/RenderCardLabelColorChoice.ts'
import { renderCardLabelCreateHeader } from '../RenderCardLabelCreateHeader/RenderCardLabelCreateHeader.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardLabelCreate = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftNewLabelColor, draftNewLabelName, savingNewLabel } = state
  return [
    {
      childCount: 3,
      className: 'TrelloCardLabelCreate',
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelCreateHeader(),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabelCreatePreview',
        getLabelColorClassName(draftNewLabelColor),
      ),
      type: VirtualDomElements.Div,
    },
    text(draftNewLabelName || TrelloStrings.labelTitle()),
    {
      childCount: 5,
      className: 'TrelloCardLabelCreateFields',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text(TrelloStrings.title()),
    {
      autocomplete: 'off',
      childCount: 0,
      className: 'TrelloInput',
      disabled: savingNewLabel,
      name: 'newLabelName',
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: TrelloStrings.labelTitle(),
      type: VirtualDomElements.Input,
      value: draftNewLabelName,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text(TrelloStrings.selectAColor()),
    {
      childCount: labelColors.length,
      className: 'TrelloCardLabelColorGrid',
      type: VirtualDomElements.Div,
    },
    ...labelColors.map((color) => renderCardLabelColorChoice(state, color)),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloPrimaryButton',
      ),
      disabled: savingNewLabel || !draftNewLabelName.trim(),
      name: 'createCardLabel',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingNewLabel ? TrelloStrings.creating() : TrelloStrings.create()),
  ]
}
