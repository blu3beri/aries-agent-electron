import React from 'react'
import Home from './pages/home/Home'
import { FileSystem } from '@aries-framework/core'
import Indy from 'indy-sdk'

declare global {
  interface Window {
    indy: typeof Indy
    fs: FileSystem
  }
}

const App: React.FC = () => <Home />

export default App
