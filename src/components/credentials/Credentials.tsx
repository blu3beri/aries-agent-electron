import {
  Agent,
  ConnectionRecord,
  CredentialPreview,
  CredentialRecord,
} from 'aries-framework'
import { CredDef, Schema } from 'indy-sdk'
import React, { useEffect, useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Credentials.scss'

type NewCredentialProps = {
  setShowNewCredential: Function
  credentialDefinitions: CredDef[]
  connections: ConnectionRecord[]
}

const getCredentials = async (agent: Agent, setCredentials: Function) => {
  setCredentials(await agent.credentials.getAll())
}

const getConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent.connections.getAll())
}

// TODO: static definition id for now
const getCredentialDefinition = async (agent: Agent, id = '1212') => {
  try {
    return await agent.ledger.getCredentialDefinition(id)
  } catch (e) {
    console.error(e)
  }
}

const getSchema = async (agent: Agent, id: string) => {
  try {
    return await agent.ledger.getSchema(id)
  } catch (e) {
    console.error(e)
  }
}

// Issuer sends an offer
const offerCredential = async (
  agent: Agent,
  connectionId: string,
  preview: CredentialPreview,
  credentialDefinitionId: string
) => {
  try {
    await agent.credentials.offerCredential(connectionId, {
      preview,
      credentialDefinitionId,
    })
  } catch (e) {
    console.error(e)
  }
}

// Holder accepts the offer
const acceptOffer = async (agent: Agent, id: string) => {
  try {
    await agent.credentials.acceptOffer(id)
  } catch (e) {
    console.error(e)
  }
}

// Issuer accepts the request
const acceptRequest = async (agent: Agent, id: string) => {
  try {
    await agent.credentials.acceptRequest(id)
  } catch (e) {
    console.error(e)
  }
}

// Holder accepts the credential
const acceptCredential = async (agent: Agent, id: string) => {
  try {
    await agent.credentials.acceptCredential(id)
  } catch (e) {
    console.error(e)
  }
}

const Credentials: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialRecord[]>([])
  const [credential, setCredential] = useState<CredentialRecord>()
  const [showNewCredential, setShowNewCredential] = useState<boolean>(false)
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [credentialDefinitions, setCredentialDefinitions] = useState<CredDef[]>(
    []
  )

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      getCredentials(agent, setCredentials)
      getConnections(agent, setConnections)
    }
  }, [agent])

  return agent ? (
    showNewCredential ? (
      <NewCredential
        setShowNewCredential={setShowNewCredential}
        credentialDefinitions={credentialDefinitions}
        connections={connections}
      />
    ) : (
      <div>
        <h1>Credentials</h1>
        {credentials.forEach((credential) => {
          return <div>{credential.connectionId}</div>
        })}
        <button
          className="NewCredentialButton"
          onClick={() => setShowNewCredential(true)}
        >
          <b>+</b>
        </button>
      </div>
    )
  ) : (
    <div className={'ConnectionContainer'}>
      <h1>Loading!</h1>
    </div>
  )
}

const NewCredential: React.FC<NewCredentialProps> = (props) => {
  type CredentialObject = {
    credentialDefinitionId: string
    connectionId: string
    preview: CredentialPreview
  }

  const [credentialObject, setCredentialObject] = useState<CredentialObject>({
    connectionId: '',
    credentialDefinitionId: '',
    preview: new CredentialPreview({ attributes: [] }),
  })

  const handleChange = (key: string, e: any) => {
    switch (key) {
      case 'connectionId':
        credentialObject.connectionId = e.target.value
        break
      case 'credentialDefinitionId':
        credentialObject.credentialDefinitionId = e.target.value
        break
      case 'preview':
        credentialObject.preview = e.target.value
        break
      default:
        console.error(`No valid key: ${key}`)
    }
    setCredentialObject(credentialObject)
    console.log(credentialObject)
  }

  return (
    <div>
      <div className="TitleContainer">
        <h1>New Credential</h1>
        <button
          className="BackButton"
          onClick={() => props.setShowNewCredential(false)}
        >
          <b>back</b>
        </button>
      </div>
      <div>
        <div>
          <label>Choose Credential Definition: </label>
          <select onChange={(e) => handleChange('credentialDefinitionId', e)}>
            {props.credentialDefinitions.map((credDef) => {
              return <option value={credDef.id}>{credDef.id}</option>
            })}
          </select>
          <label>Choose Receiver: </label>
          <select onChange={(e) => handleChange('connectionId', e)}>
            {props.connections.map((connection) => {
              return (
                <option value={connection.id}>
                  {connection.alias
                    ? connection.alias + ' - ' + connection.id
                    : connection.id}
                </option>
              )
            })}
          </select>
          <div>
            <p>
              Enter the credentials (these fields will be generated based on the
              cred def
            </p>
            <input />
          </div>
        </div>
        <button>Send!</button>
      </div>
    </div>
  )
}

export default Credentials
