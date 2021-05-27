import {
  Agent,
  ConnectionRecord,
  CredentialPreview,
  CredentialPreviewAttribute,
  CredentialRecord,
} from 'aries-framework'
import {
  Attachment,
  AttachmentData,
} from 'aries-framework/build/src/decorators/attachment/Attachment'
import { CredDef, Schema } from 'indy-sdk'
import React, { useEffect, useState } from 'react'
import { useAgent } from '../../providers/agent'
import { Base64 } from '../../utils/base64'
import './Credentials.scss'

type NewCredentialProps = {
  setShowNewCredential: Function
  credentialDefinitions: CredDef[]
  connections: ConnectionRecord[]
  schema: Schema
  agent: Agent
}

type CredentialProps = {
  agent: Agent
  credential: CredentialRecord
  setCredential: Function
  setShowCredential: Function
}

const getCredentials = async (agent: Agent, setCredentials: Function) => {
  const credentials = await agent.credentials.getAll()
  setCredentials(credentials)
}

const getConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent.connections.getAll())
}

// TODO: static definition id for now, because we cant get all the definition ids of a did
// TODO: why is schemaId in the cred def `67195`
const getCredentialDefinition = async (
  agent: Agent,
  setCredentialDefinition: Function,
  setSchema: Function,
  id = 'CHfjA9fwnxWw4aBhPueNZD:3:CL:67233:tag'
) => {
  try {
    const credDef = await agent.ledger.getCredentialDefinition(id)
    setCredentialDefinition([credDef])
    await getSchema(
      agent,
      'CHfjA9fwnxWw4aBhPueNZD:2:demoSchema#1622125997571:1.0.1',
      setSchema
    )
  } catch (e) {
    console.error(e)
  }
}

// Retrieves the schema
const getSchema = async (agent: Agent, id: string, setSchema: Function) => {
  try {
    const schema = await agent.ledger.getSchema(id)
    setSchema(schema)
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
const acceptOffer = async (
  agent: Agent,
  id: string,
  setCredential?: Function
) => {
  try {
    const credentialRecord = await agent.credentials.acceptOffer(id)
    console.log(credentialRecord)
    if (setCredential) {
      setCredential(credentialRecord)
    }
  } catch (e) {
    console.error(e)
  }
}

// Issuer accepts the request
const acceptRequest = async (
  agent: Agent,
  id: string,
  setCredential?: Function
) => {
  try {
    const credentialRecord = await agent.credentials.acceptRequest(id)
    console.log(credentialRecord)
    if (setCredential) {
      setCredential(credentialRecord)
    }
  } catch (e) {
    console.error(e)
  }
}

// Holder accepts the credential
const acceptCredential = async (
  agent: Agent,
  id: string,
  setCredential?: Function
) => {
  try {
    const credentialRecord = await agent.credentials.acceptCredential(id)
    if (setCredential) {
      setCredential(credentialRecord)
    }
  } catch (e) {
    console.error(e)
  }
}

const Credentials: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialRecord[]>([])
  const [credential, setCredential] = useState<CredentialRecord>()
  const [showCredential, setShowCredential] = useState<boolean>(false)
  const [showNewCredential, setShowNewCredential] = useState<boolean>(false)
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [schema, setSchema] = useState<Schema>()
  const [credentialDefinitions, setCredentialDefinitions] = useState<CredDef[]>(
    []
  )

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      getCredentials(agent, setCredentials)
      getConnections(agent, setConnections)
      getCredentialDefinition(agent, setCredentialDefinitions, setSchema)
    }
  }, [agent])

  const refreshCredentials = async () => {
    setCredentials([])
    await getCredentials(agent!, setCredentials)
  }

  const loadCredential = (credential: CredentialRecord) => {
    setCredential(credential)
    setShowCredential(true)
  }

  return agent ? (
    showNewCredential ? (
      <NewCredential
        setShowNewCredential={setShowNewCredential}
        credentialDefinitions={credentialDefinitions}
        connections={connections}
        schema={schema!}
        agent={agent}
      />
    ) : showCredential ? (
      <Credential
        agent={agent}
        credential={credential!}
        setCredential={setCredential}
        setShowCredential={setShowCredential}
      />
    ) : (
      <div>
        <div className="TitleContainer">
          <h1>Credentials</h1>
          <button className="BackButton" onClick={() => refreshCredentials()}>
            <b>Refresh</b>
          </button>
        </div>
        <ul className={'CredentialsList'}>
          {credentials.map((credential) => {
            return (
              <li
                className={'CredentialsItem'}
                key={credential.id}
                onClick={() => {
                  loadCredential(credential)
                }}
              >
                <b>{credential.state}</b>
                <p>{credential.connectionId}</p>
              </li>
            )
          })}
        </ul>
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

  const [attachment, setAttachment] =
    useState<{ name: string; attachment: Attachment | undefined }>()
  const [showAttachment, setShowAttachment] = useState<boolean>(false)
  const [credentialObject, setCredentialObject] = useState<CredentialObject>({
    connectionId: props.connections[0].id,
    credentialDefinitionId: props.credentialDefinitions[0].id,
    preview: new CredentialPreview({ attributes: [] }),
  })

  const handleChange = async (key: string, e: any, previewKey?: string) => {
    switch (key) {
      case 'connectionId':
        credentialObject.connectionId = e.target.value
        break
      case 'credentialDefinitionId':
        credentialObject.credentialDefinitionId = e.target.value
        break
      case 'preview':
        const attribute = credentialObject.preview.attributes.find(
          (attr) => attr.name === previewKey
        )
        if (attribute) {
          attribute.value = e.target.value
        } else if (previewKey === 'profilePicture') {
          credentialObject.preview.attributes.push(
            new CredentialPreviewAttribute({
              name: previewKey!,
              value: await new Base64().fromFile(e.target.files[0]),
              mimeType: 'image/png',
            })
          )
        } else {
          credentialObject.preview.attributes.push(
            new CredentialPreviewAttribute({
              name: previewKey!,
              value: e.target.value,
              mimeType: 'text/plain',
            })
          )
        }
        console.log(credentialObject.preview.attributes)
        break
      default:
        console.error(`No valid key: ${key}`)
    }
    setCredentialObject(credentialObject)
  }

  const handleAttachmentChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setAttachment({
        name: attachment?.name ? attachment.name : 'attach#1',
        attachment: new Attachment({
          filename: e.target.files![0].name,
          mimeType: e.target.files![0].type,
          byteCount: e.target.files![0].size,
          lastmodTime: e.target.files![0].lastModified,
          data: new AttachmentData({
            base64: await new Base64().fromFile(e.target.files![0]),
          }),
        }),
      })
    } else {
      setAttachment({
        name: e.target.value,
        attachment: attachment?.attachment ? attachment.attachment : undefined,
      })
    }
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
              return (
                <option key={credDef.id} value={credDef.id}>
                  {credDef.id}
                </option>
              )
            })}
          </select>
          <label>Choose Receiver: </label>
          <select onChange={(e) => handleChange('connectionId', e)}>
            {props.connections.map((connection) => {
              return (
                <option value={connection.id} key={connection.id}>
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
            {props.schema.attrNames.map((name) => {
              return name !== 'profilePicture' ? (
                <div key={name}>
                  <p>{name}</p>
                  <input
                    placeholder={name}
                    onChange={(e) => handleChange('preview', e, name)}
                  />
                </div>
              ) : (
                <div key={name}>
                  <p>{name}</p>
                  <input
                    type="file"
                    placeholder={name}
                    onChange={(e) => handleChange('preview', e, name)}
                  />
                </div>
              )
            })}
            <button onClick={() => setShowAttachment(true)}>
              Add Attachment!
            </button>
            {showAttachment ? (
              <div>
                <input
                  type="text"
                  placeholder="name"
                  onChange={(e) => handleAttachmentChange(e)}
                />
                <input
                  type="file"
                  placeholder="name"
                  onChange={(e) => handleAttachmentChange(e)}
                />
                <button onClick={() => setShowAttachment(false)}>Cancel</button>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <button
          onClick={() =>
            offerCredential(
              props.agent,
              credentialObject.connectionId,
              credentialObject.preview,
              credentialObject.credentialDefinitionId
            )
          }
        >
          Send!
        </button>
      </div>
    </div>
  )
}

const Credential: React.FC<CredentialProps> = (props) => {
  return (
    <div>
      <div className="TitleContainer">
        <h1>Credential</h1>
        <button
          className="BackButton"
          onClick={() => props.setShowCredential(false)}
        >
          <b>back</b>
        </button>
      </div>
      <div>
        {Object.entries(props.credential)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => {
            return (
              <div key={key}>
                <p>
                  {key} - {value}
                </p>
              </div>
            )
          })}
        {props.credential.credentialAttributes?.map((attribute) => {
          if (attribute.mimeType === 'image/png') {
            return (
              <div className="CredentialAttributeImage" key={attribute.name}>
                {attribute.name} = {attribute.value}
              </div>
            )
          } else {
            return (
              <div className="CredentialAttributeText" key={attribute.name}>
                {attribute.name} - {attribute.value}
              </div>
            )
          }
        })}
      </div>
      <button
        onClick={() => {
          switch (props.credential.state) {
            case 'offer-received':
              acceptOffer(props.agent, props.credential.id, props.setCredential)
              break
            case 'request-received':
              acceptRequest(
                props.agent,
                props.credential.id,
                props.setCredential
              )
              break
            case 'credential-received':
              acceptCredential(
                props.agent,
                props.credential.id,
                props.setCredential
              )
              break
            default:
              console.error(
                `state (${props.credential.state}) is not supported yet!`
              )
          }
        }}
      >
        Accept!
      </button>
    </div>
  )
}

export default Credentials
