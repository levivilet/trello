import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderField = (
  label: string,
  name: string,
  value: string,
  inputType?: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'TrelloField',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text(label),
    {
      childCount: 0,
      className: 'TrelloInput',
      ...(inputType && { inputType }),
      name,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: label,
      type: VirtualDomElements.Input,
      value,
    },
  ]
}
