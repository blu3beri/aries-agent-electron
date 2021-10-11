import Indy from 'indy-sdk'
import React from 'react'

declare global {
  interface Window {
    indy: typeof Indy
    fs: FileSystem
  }
}

const App: React.FC = () => (
  <div>
    <h1>Hello Indy!</h1>
    <br />
    <button onClick={testIndy}>test indy!</button>
  </div>
)

// function to test if indy is working correctly
const testIndy = async () => {
  await window.indy.deleteWallet({ id: '123' }, { key: '123' })
  window.indy
    .createWallet({ id: '123' }, { key: '123' })
    .then((_) => console.log('sucess!'))
    .catch((e) => console.error(e))
}

export default App
