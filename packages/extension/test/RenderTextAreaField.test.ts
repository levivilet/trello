import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderTextAreaField } from '../src/parts/RenderTextAreaField/RenderTextAreaField.ts'

test('renders a labelled text area', () => {
  expect(renderTextAreaField('Description', 'description', 'Details')).toEqual([
    {
      childCount: 2,
      className: 'TrelloField',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: 'Description',
      type: VirtualDomElements.Text,
    },
    {
      childCount: 0,
      className: 'TrelloTextArea',
      name: 'description',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'Description',
      type: VirtualDomElements.TextArea,
      value: 'Details',
    },
  ])
})
