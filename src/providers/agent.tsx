import { Agent, ConsoleLogger, HttpOutboundTransporter, InitConfig, LogLevel } from 'aries-framework'
import { FileSystem } from 'aries-framework/build/src/storage/fs/FileSystem'
import dotenv from 'dotenv'
import type Indy from 'indy-sdk'
import path from 'path'
import React, { useContext, useEffect, useState } from 'react'
import { PollingInboundTransporter } from '../transporters/PollingInboundTransporter'
import { genesisTransactions } from './genesis'
dotenv.config({ path: path.resolve(__dirname, '.env') })

declare global {
  interface Window {
    indy: typeof Indy
    fs: FileSystem
  }
}

function wrapIndyCallWithErrorHandling(func: any) {
  return async (...args: any[]) => {
    try {
      return await func(...args)
    } catch (e) {
      e.name = 'IndyError'
      e.indyName = e.message
      throw e
    }
  }
}

const indyWithErrorHandling = Object.fromEntries(
  Object.entries(window.indy).map(([funcName, funcImpl]) => [funcName, wrapIndyCallWithErrorHandling(funcImpl)])
)

type AgentContextProps = {
  agentConfig: Partial<InitConfig>
  children: React.ReactNode
}

type AgentContextValue = {
  agent: Agent | undefined
}
const AgentContext = React.createContext<AgentContextValue>({
  agent: undefined,
})

const useAgent = (): AgentContextValue => useContext(AgentContext)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const AgentProvider = (props: AgentContextProps) => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
  console.log(process.env)

  const initAgent = async (): Promise<void> => {
    const agentConfig: InitConfig = {
      mediatorUrl: 'http://localhost:3001',
      label: '7',
      walletConfig: { id: '7' },
      walletCredentials: { key: '7' },
      autoAcceptConnections: true,
      indy: indyWithErrorHandling as unknown as typeof Indy,
      fileSystem: window.fs,
      genesisTransactions,
      publicDid: 'CHfjA9fwnxWw4aBhPueNZD',
      publicDidSeed: '12312312312312345645645645645687',
      logger: new ConsoleLogger(LogLevel.debug),
    }
    const agent = new Agent(agentConfig)
    agent.setInboundTransporter(new PollingInboundTransporter())
    agent.setOutboundTransporter(new HttpOutboundTransporter(agent))
    await agent.init().catch((e) => console.error(e))
    console.log('agent instance created')

    setAgent(agent)
  }

  useEffect(() => {
    try {
      initAgent()
    } catch (e) {
      console.warn(e)
    }
  }, [])

  return <AgentContext.Provider value={{ agent }}>{props.children}</AgentContext.Provider>
}

export { AgentProvider, useAgent }
