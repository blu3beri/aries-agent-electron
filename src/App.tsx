import React from 'react'
import { CustomView, isMacOs } from 'react-device-detect'
import './App.scss'
import Header from './components/header/Header'
import Home from './pages/home/Home'
import { AgentProvider } from './providers/agent'

const App: React.FC = () => {
  return (
    <AgentProvider agentConfig={{}}>
      <div className="App">
        <CustomView condition={isMacOs}>
          <Header />
        </CustomView>
        <div className={`AppContainer ${isMacOs ? 'MacOS' : ''}`}>
          <Home />
        </div>
      </div>
    </AgentProvider>
  )
}

export default App
