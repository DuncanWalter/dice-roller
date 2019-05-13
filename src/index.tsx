import React from 'react'

import { render } from 'react-dom'
import { createHashHistory } from 'history'
import { SpiderRoot } from '@dwalter/spider-hook'
import { Provider } from 'daggerboard'
import { createDevMiddleware } from '@dwalter/spider-dev-middleware'
import { DefaultThemeProvider } from './components'
import { App } from './App'

const anchorElement = document.getElementById('anchor')

if (anchorElement) {
  render(
    <SpiderRoot
      configureStore={createStore => {
        if (process.env.NODE_ENV === 'development') {
          return createStore(createDevMiddleware())
        } else {
          return createStore()
        }
      }}
    >
      <DefaultThemeProvider>
        <Provider history={createHashHistory()}>
          <App />
        </Provider>
      </DefaultThemeProvider>
    </SpiderRoot>,
    anchorElement,
  )
} else {
  console.error('No anchor element provided')
}
