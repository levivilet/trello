import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import { renderCardDescriptionEditor } from '../RenderCardDescriptionEditor/RenderCardDescriptionEditor.ts'
import { renderCardDescriptionHeader } from '../RenderCardDescriptionHeader/RenderCardDescriptionHeader.ts'
import { renderCardDescriptionPreview } from '../RenderCardDescriptionPreview/RenderCardDescriptionPreview.ts'

export const renderCardDescription = (
  state: Readonly<TrelloViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  const { editingCardDescription } = state
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionSection',
      type: VirtualDomElements.Div,
    },
    ...renderCardDescriptionHeader(),
    ...(editingCardDescription
      ? renderCardDescriptionEditor(state)
      : renderCardDescriptionPreview(description)),
  ]
}
