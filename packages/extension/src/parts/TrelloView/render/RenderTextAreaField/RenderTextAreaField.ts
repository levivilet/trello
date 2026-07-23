import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderTextAreaField = (
  label: string,
  name: string,
  value: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloField',
      type: VirtualDomElements.Div,
    },
    text(label),
    {
      childCount: 0,
      className: 'TrelloTextArea',
      name,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: label,
      type: VirtualDomElements.TextArea,
      value,
    },
  ]
}
