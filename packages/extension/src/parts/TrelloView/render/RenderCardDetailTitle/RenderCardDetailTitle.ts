import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'

export const renderCardDetailTitle = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardTitle, editingCardTitle } = state
  const className = editingCardTitle
    ? MergeClassNames.mergeClassNames(
        'TrelloCardDetailTitleInput',
        'TrelloCardDetailTitleInputEditing',
      )
    : 'TrelloCardDetailTitleInput'
  return [
    {
      childCount: 2,
      className: 'TrelloCardDetailTitleSizer',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className,
      name: 'cardTitle',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onClick: DomEventListenerFunctions.HandleClick,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      rows: 1,
      type: VirtualDomElements.TextArea,
      value: draftCardTitle,
    },
    {
      ariaHidden: true,
      childCount: 1,
      className: 'TrelloCardDetailTitleMirror',
      type: VirtualDomElements.Div,
    },
    text(draftCardTitle || ' '),
  ]
}
