import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderMarkdown } from '../RenderMarkdown/RenderMarkdown.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const renderCardDescriptionPreview = (
  description: string,
): readonly VirtualDomNode[] => {
  const trimmedDescription = description.trim()
  if (!trimmedDescription) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'TrelloCardDescriptionPreview',
          'TrelloCardDescriptionPlaceholder',
        ),
        name: 'editCardDescription',
        onClick: DomEventListenerFunctions.HandleClick,
        role: AriaRoles.None,
        type: VirtualDomElements.Div,
      },
      text(TrelloStrings.addDetailedDescription()),
    ]
  }
  const markdown = renderMarkdown(description)
  return [
    {
      childCount: markdown.childCount,
      className: 'TrelloCardDescriptionPreview',
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    ...markdown.dom,
  ]
}
