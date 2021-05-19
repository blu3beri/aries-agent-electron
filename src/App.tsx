import React from 'react'
import './App.scss'
import Header from './components/header/Header'
import Home from './pages/home/Home'
import { isMacOs, CustomView } from 'react-device-detect'

const App: React.FC = () => {
  return (
    <div className="App">
      <CustomView condition={isMacOs}>
        <Header />
      </CustomView>
      <div className={`AppContainer ${isMacOs ? 'MacOS' : ''}`}>
        <Home />
      </div>
    </div>
  )
}

export default App
