import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const fieldNode: VirtualDomNode = {
  childCount: 2,
  className: 'TrelloField',
  type: VirtualDomElements.Div,
}

const labelNode: VirtualDomNode = {
  childCount: 1,
  type: VirtualDomElements.Label,
}

export const renderField = (
  label: string,
  name: string,
  value: string,
  inputType?: string,
): readonly VirtualDomNode[] => {
  return [
    fieldNode,
    labelNode,
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
