interface DomEventListener {
  readonly name: string | number
  readonly params: readonly string[]
  readonly preventDefault?: boolean
}

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: 'handleDragStart',
      params: ['handleViewEvent', 'dragstart', 'event.target.name'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleViewEvent', 'dragend', 'event.target.name'],
    },
    {
      name: 'handleDragOver',
      params: ['handleViewEvent', 'dragover', 'event.target.name'],
      preventDefault: true,
    },
    {
      name: 'handleDragLeave',
      params: ['handleViewEvent', 'dragleave', 'event.target.name'],
    },
    {
      name: 'handleDrop',
      params: ['handleViewEvent', 'drop', 'event.target.name'],
      preventDefault: true,
    },
    {
      name: 'handleKeyDown',
      params: ['handleViewEvent', 'keydown', 'event.target.name', 'event.key'],
    },
    {
      name: 'handlePointerDown',
      params: [
        'handleViewEvent',
        'pointerdown',
        'event.target.name',
        'event.clientX',
      ],
    },
    {
      name: 'handlePointerMove',
      params: [
        'handleViewEvent',
        'pointermove',
        'event.target.name',
        'event.clientX',
      ],
    },
    {
      name: 'handlePointerUp',
      params: ['handleViewEvent', 'pointerup', 'event.target.name'],
    },
  ]
}
