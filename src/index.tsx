import React from 'react'

import { render } from 'react-dom'
import { createHashHistory } from 'history'
import { StoreProvider } from './state-store-react'
import { Provider } from 'daggerboard'
import { DefaultThemeProvider } from './components'
import { App } from './App'

const anchorElement = document.getElementById('anchor')

if (anchorElement) {
  render(
    <StoreProvider>
      <DefaultThemeProvider>
        <Provider history={createHashHistory()}>
          <App />
        </Provider>
      </DefaultThemeProvider>
    </StoreProvider>,
    anchorElement,
  )
} else {
  console.error('No anchor element provided')
}
