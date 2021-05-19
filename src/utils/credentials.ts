import { CredentialRecord } from 'aries-framework'
import fetch from 'node-fetch'

const URL = 'http://localhost:3010'

export const getCredentials = async (): Promise<CredentialRecord[]> => {
  return await (await fetch(`${URL}/credentials`)).json()
}
