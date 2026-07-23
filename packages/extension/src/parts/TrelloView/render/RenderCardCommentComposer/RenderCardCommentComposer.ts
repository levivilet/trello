import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../../../MergeClassNames/MergeClassNames.ts'
import { renderCardCommentButton } from '../RenderCardCommentButton/RenderCardCommentButton.ts'

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
      text('Write a comment'),
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
      placeholder: 'Write a comment...',
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
      savingComment ? 'Saving...' : 'Save',
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentSaveButton',
      ),
      savingComment,
    ),
    ...renderCardCommentButton(
      'cancelWriteComment',
      'Cancel',
      MergeClassNames.mergeClassNames(
        'TrelloButton',
        'TrelloCardCommentCancelButton',
      ),
      savingComment,
    ),
  ]
}
