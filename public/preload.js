const { contextBridge } = require('electron')
const indy = require('indy-sdk')

contextBridge.exposeInMainWorld('indy', indy)
