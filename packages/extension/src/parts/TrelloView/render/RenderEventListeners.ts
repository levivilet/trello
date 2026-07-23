interface DomEventListener {
  readonly name: string | number
  readonly params: readonly string[]
  readonly preventDefault?: boolean
  readonly trackPointerEvents?: readonly (string | number)[]
}

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: 'handleImageError',
      params: ['handleImageError', 'event.target.name'],
    },
    {
      name: 'handleDragStart',
      params: ['handleDragStart', 'event.target.name'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleDragEnd'],
    },
    {
      name: 'handleDragOver',
      params: ['handleDragOver', 'event.currentTarget.name'],
      preventDefault: true,
    },
    {
      name: 'handleDragLeave',
      params: ['handleDragLeave'],
    },
    {
      name: 'handleDrop',
      params: ['handleDrop', 'event.currentTarget.name'],
      preventDefault: true,
    },
    {
      name: 'handleKeyDown',
      params: [
        'handleKeyDown',
        'event.target.name',
        'event.key',
        'event.ctrlKey',
      ],
    },
    {
      name: 'handlePointerDown',
      params: ['handlePointerDown', 'event.target.name', 'event.clientX'],
      trackPointerEvents: ['handlePointerMove', 'handlePointerUp'],
    },
    {
      name: 'handleCardLabelPickerPointerDown',
      params: ['handlePointerDown', 'event.currentTarget.name'],
      preventDefault: true,
    },
    {
      name: 'handleAddCardActionPointerDown',
      params: ['handlePointerDown', 'event.currentTarget.name'],
      preventDefault: true,
    },
    {
      name: 'handleCardDescriptionCancelPointerDown',
      params: ['handlePointerDown', 'event.currentTarget.name'],
      preventDefault: true,
    },
    {
      name: 'handlePointerMove',
      params: ['handlePointerMove', 'event.clientX'],
    },
    {
      name: 'handlePointerUp',
      params: ['handlePointerUp'],
    },
  ]
}
