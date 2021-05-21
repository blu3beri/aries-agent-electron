import { Agent, HttpOutboundTransporter, InitConfig } from 'aries-framework'
import { FileSystem } from 'aries-framework/build/src/storage/fs/FileSystem'
import dotenv from 'dotenv'
import type Indy from 'indy-sdk'
import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { PollingInboundTransporter } from '../transporters/PollingInboundTransporter'
import { genesisTransactions } from './genesis'
dotenv.config()

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
  Object.entries(window.indy).map(([funcName, funcImpl]) => [
    funcName,
    wrapIndyCallWithErrorHandling(funcImpl),
  ])
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

  const initAgent = async (): Promise<void> => {
    const agentConfig: InitConfig = {
      mediatorUrl: 'http://localhost:3001',
      label: process.env.AGENT_LABEL || uuid(),
      walletConfig: { id: process.env.WALLET_NAME || uuid() },
      walletCredentials: { key: process.env.WALLET_KEY || uuid() },
      autoAcceptConnections: true,
      // logger: new ConsoleLogger(LogLevel.debug),
      indy: indyWithErrorHandling as unknown as typeof Indy,
      fileSystem: window.fs,
      genesisTransactions,
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

  return (
    <AgentContext.Provider value={{ agent }}>
      {props.children}
    </AgentContext.Provider>
  )
}

export { AgentProvider, useAgent }
