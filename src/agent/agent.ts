import { Agent, ConsoleLogger, FileSystem, LogLevel } from '@aries-framework/core'
import fetch from 'electron-fetch'
import events from 'events'
import Indy from 'indy-sdk'
import nodeFetch from 'node-fetch'
import ws from 'ws'

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
      // TODO: properly handle errors
      throw e
    }
  }
}

const indyWithErrorHandling = Object.fromEntries(
  Object.entries(window.indy).map(([funcName, funcImpl]) => [funcName, wrapIndyCallWithErrorHandling(funcImpl)])
) as unknown as typeof Indy

export const setupAndInitializeAgent = async (label = 'test agent bob') => {
  const electronAgentDependencies = {
    indy: indyWithErrorHandling,
    FileSystem: ElectronFileSystem,
    fetch: fetch as unknown as typeof nodeFetch,
    EventEmitterClass: events.EventEmitter,
    WebSocketClass: ws,
  }

  const agent = new Agent(
    { label, walletConfig: { key: '1266', id: '1266' }, logger: new ConsoleLogger(LogLevel.test) },
    electronAgentDependencies
  )

  try {
    await agent.initialize()
  } catch (e) {
    console.error(e)
  }

  return agent
}
