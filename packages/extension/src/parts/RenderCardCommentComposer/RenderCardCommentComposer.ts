import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardCommentButton } from '../RenderCardCommentButton/RenderCardCommentButton.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardCommentComposer = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const { draftComment, savingComment, writingComment } = state
  if (!writingComment) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'TrelloButton',
          'TrelloCardCommentWriteButton',
        ),
        name: 'startWriteComment',
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(TrelloStrings.writeAComment()),
    ]
  }
  return [
    {
      childCount: 2,
      className: 'TrelloCardCommentComposer',
      type: VirtualDomElements.Div,
    },
    {
      autofocus: true,
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'TrelloTextArea',
        'TrelloCardCommentTextArea',
      ),
      disabled: savingComment,
      name: 'cardComment',
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: TrelloStrings.writeACommentPlaceholder(),
      type: VirtualDomElements.TextArea,
      value: draftComment,
    },
    {
      childCount: 2,
      className: 'TrelloCardCommentActions',
      type: VirtualDomElements.Div,
    },
    ...renderCardCommentButton(
      'submitComment',
      savingComment ? TrelloStrings.saving() : TrelloStrings.save(),
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentSaveButton',
      ),
      savingComment,
    ),
    ...renderCardCommentButton(
      'cancelWriteComment',
      TrelloStrings.cancel(),
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentCancelButton',
      ),
      savingComment,
    ),
  ]
}
