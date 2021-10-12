import React from 'react'
import { setupAndInitializeAgent } from '../../agent'

const Home: React.FC = () => (
  <div>
    <h1>Hello Aries!</h1>
    <br />
    <button onClick={testIndy}>test Indy!</button>
    <br />
    <button onClick={() => setupAndInitializeAgent()}>test Agent!</button>
  </div>
)

const testIndy = async () => {
  window.indy.createWallet({ id: '1266' }, { key: '1266' }).then(() => console.log('success'))
}

export default Home
