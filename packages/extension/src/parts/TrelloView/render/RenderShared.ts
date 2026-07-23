import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderError = (error: string): readonly VirtualDomNode[] => {
  if (!error) {
    return []
  }
  return [
    {
      childCount: 1,
      className: 'TrelloError',
      type: VirtualDomElements.Div,
    },
    text(error),
  ]
}

export const renderTitle = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloTitle',
      type: VirtualDomElements.H2,
    },
    text(value),
  ]
}

export const renderListTitle = (value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloListTitle',
      type: VirtualDomElements.H3,
    },
    text(value),
  ]
}

export const renderToolbar = (
  children: readonly (readonly VirtualDomNode[])[],
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: children.length,
      className: 'TrelloToolbar',
      type: VirtualDomElements.Div,
    },
    ...children.flat(),
  ]
}

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
