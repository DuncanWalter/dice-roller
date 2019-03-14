import React from 'react'

import { render } from 'react-dom'
import { SpiderRoot } from '@dwalter/spider-hook'
import { App } from './App'
import { DefaultThemeProvider } from './components'

const anchorElement = document.getElementById('anchor')

if (anchorElement) {
  render(
    <SpiderRoot>
      <DefaultThemeProvider>
        <App />
      </DefaultThemeProvider>
    </SpiderRoot>,
    anchorElement,
  )
} else {
  console.error('No anchor element provided')
}
