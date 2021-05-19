const { contextBridge } = require('electron')
const indy = require('indy-sdk')
const NodeFileSystem =
  require('aries-framework/build/src/storage/fs/NodeFileSystem').NodeFileSystem

const fs = new NodeFileSystem()
contextBridge.exposeInMainWorld('indy', indy)
contextBridge.exposeInMainWorld('fs', {
  write: fs.write,
  read: fs.read,
  exists: fs.exists,
  basePath: fs.basePath,
})
