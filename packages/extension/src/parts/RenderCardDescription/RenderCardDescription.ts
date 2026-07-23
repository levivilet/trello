import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import { renderCardDescriptionEditor } from '../RenderCardDescriptionEditor/RenderCardDescriptionEditor.ts'
import { renderCardDescriptionHeader } from '../RenderCardDescriptionHeader/RenderCardDescriptionHeader.ts'
import { renderCardDescriptionPreview } from '../RenderCardDescriptionPreview/RenderCardDescriptionPreview.ts'

const renderCardDescriptionContent = (
  state: Readonly<TrelloViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  const { editingCardDescription } = state
  if (editingCardDescription) {
    return renderCardDescriptionEditor(state)
  }
  return renderCardDescriptionPreview(description)
}

export const renderCardDescription = (
  state: Readonly<TrelloViewState>,
  description: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloCardDescriptionSection',
      type: VirtualDomElements.Div,
    },
    ...renderCardDescriptionHeader(),
    ...renderCardDescriptionContent(state, description),
  ]
}
