import { ConnectionInvitationMessage, ConnectionRecord } from 'aries-framework'
import fetch from 'node-fetch'

const URL = 'http://localhost:3010'

export const getConnections = async (): Promise<ConnectionRecord[]> => {
  return await (await fetch(`${URL}/connections`)).json()
}

export const createConnection = async (config: {
  autoAcceptConnection: boolean
  alias: string
}): Promise<ConnectionInvitationMessage> => {
  const fetchConfig = {
    method: 'post',
    body: JSON.stringify(config),
    headers: { 'Content-type': 'application/json' },
  }
  try {
    return (await (await fetch(`${URL}/connections`, fetchConfig)).json()) as ConnectionInvitationMessage
  } catch (e) {
    throw new Error(e)
  }
}

export const receiveConnection = async (invitationUrl: string): Promise<ConnectionInvitationMessage> => {
  const invitation = { url: invitationUrl, autoAcceptConnection: true, alias: 'INVITEE' }
  const fetchConfig = {
    method: 'post',
    body: JSON.stringify(invitation),
    headers: { 'Content-type': 'application/json' },
  }
  try {
    return (await (await fetch(`${URL}/connections/receive`, fetchConfig)).json()) as ConnectionInvitationMessage
  } catch (e) {
    throw new Error(e)
  }
}
