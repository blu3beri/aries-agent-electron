import { Agent, AriesFrameworkError, ConsoleLogger, FileSystem, IndySdkError, LogLevel } from '@aries-framework/core'
import fetch from 'electron-fetch'
import events from 'events'
import nodeFetch from 'node-fetch'
import ws from 'ws'
import Indy from 'indy-sdk'

class ElectronFileSystem implements FileSystem {
  basePath = window.fs.basePath
  exists = window.fs.exists
  read = window.fs.read
  write = window.fs.write
}

const wrapIndyCallWithErrorHandling = (func: any) => {
  return async (...args: any[]) => {
    try {
      return await func(...args)
    } catch (e) {
      if (e instanceof Error || e instanceof AriesFrameworkError || e instanceof IndySdkError) {
        const error = {
          name: 'IndyError',
          indyName: e.message,
          message: e.message,
          stack: e.stack,
        }
        throw error
      }
    }
  }
}

const indyWithErrorHandling = Object.fromEntries(
  Object.entries(window.indy).map(([funcName, funcImpl]) => [funcName, wrapIndyCallWithErrorHandling(funcImpl)])
)

export const setupAndInitializeAgent = async (label = 'test agent bob') => {
  const electronAgentDependencies = {
    indy: indyWithErrorHandling as unknown as typeof Indy,
    FileSystem: ElectronFileSystem,
    fetch: fetch as unknown as typeof nodeFetch,
    EventEmitterClass: events.EventEmitter,
    WebSocketClass: ws,
  }

  const agent = new Agent(
    { label, walletConfig: { id: '12bb66', key: 'xz' }, logger: new ConsoleLogger(LogLevel.test) },
    electronAgentDependencies
  )

  await agent.initialize()

  const x = await agent.connections.createConnection({ autoAcceptConnection: true })
  console.log(x)

  return agent
}
