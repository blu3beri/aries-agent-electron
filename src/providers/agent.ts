import { Agent, ConsoleLogger, InitConfig, LogLevel } from 'aries-framework'
import { FileSystem } from 'aries-framework/build/src/storage/fs/FileSystem'
import type Indy from 'indy-sdk'
import path from 'path'
import { v4 as uuid } from 'uuid'

declare global {
  interface Window {
    indy: typeof Indy
    fs: FileSystem
  }
}

const initAgent = async () => {
  const agentConfig: InitConfig = {
    host: process.env.AGENT_HOST,
    port: process.env.AGENT_PORT || 3000,
    endpoint: process.env.AGENT_ENDPOINT,
    label: process.env.AGENT_LABEL || uuid(),
    walletConfig: { id: process.env.WALLET_NAME || uuid() },
    walletCredentials: { key: process.env.WALLET_KEY || uuid() },
    autoAcceptConnections: true,
    logger: new ConsoleLogger(LogLevel.debug),
    indy: window.indy,
    fileSystem: window.fs,
    genesisPath: path.join(__dirname, '../genesis.txn'),
  }
  const agent = new Agent(agentConfig)
  await agent.init().catch((e) => console.error(e))
  return agent
}

export default initAgent
