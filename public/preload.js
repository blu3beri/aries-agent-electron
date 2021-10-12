const { contextBridge } = require('electron')
const indy = require('indy-sdk')
const NodeFileSystem = require('@aries-framework/node').agentDependencies.FileSystem

const fs = new NodeFileSystem()
contextBridge.exposeInMainWorld('indy', { ...indy })
contextBridge.exposeInMainWorld('fs', {
  write: fs.write,
  read: fs.read,
  basePath: fs.basePath,
  exists: fs.exists,
})
