import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderField } from '../src/parts/RenderField/RenderField.ts'

const expectedField = [
  {
    childCount: 2,
    className: 'TrelloField',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 1,
    type: VirtualDomElements.Label,
  },
  {
    childCount: 0,
    text: 'API key',
    type: VirtualDomElements.Text,
  },
  {
    childCount: 0,
    className: 'TrelloInput',
    name: 'apiKey',
    onBlur: DomEventListenerFunctions.HandleBlur,
    onFocus: DomEventListenerFunctions.HandleFocus,
    onInput: DomEventListenerFunctions.HandleInput,
    placeholder: 'API key',
    type: VirtualDomElements.Input,
    value: 'key',
  },
]

test('renders a labelled input', () => {
  expect(renderField('API key', 'apiKey', 'key')).toEqual(expectedField)
})

test('renders the requested input type', () => {
  expect(renderField('API key', 'apiKey', 'key', 'password')).toEqual([
    ...expectedField.slice(0, -1),
    {
      ...expectedField.at(-1),
      inputType: 'password',
    },
  ])
})
