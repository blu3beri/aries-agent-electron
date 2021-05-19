import { ProofRecord } from 'aries-framework'
import fetch from 'node-fetch'

const URL = 'http://localhost:3010'

export const getProofs = async (): Promise<ProofRecord[]> => {
  return await (await fetch(`${URL}/proofs`)).json()
}
