import React from 'react'

import { render } from 'react-dom'
import { StoreProvider } from './state-store-react'
import { DefaultThemeProvider } from './components'
import { App } from './App'

const anchorElement = document.getElementById('anchor')

if (anchorElement) {
  render(
    <StoreProvider>
      <DefaultThemeProvider>
        <App />
      </DefaultThemeProvider>
    </StoreProvider>,
    anchorElement,
  )
} else {
  console.error('No anchor element provided')
}
