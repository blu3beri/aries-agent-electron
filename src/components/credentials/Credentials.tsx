import {
  Agent,
  ConnectionRecord,
  CredentialPreview,
  CredentialPreviewAttribute,
  CredentialRecord,
} from 'aries-framework'
import { Attachment, AttachmentData } from 'aries-framework/build/src/decorators/attachment/Attachment'
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

const base64 = new Base64()

const getCredentials = async (agent: Agent, setCredentials: Function) => {
  setCredentials(await agent.credentials.getAll())
}

const getConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent.connections.getAll())
}

const getCredentialDefinition = async (agent: Agent, setCredentialDefinition: Function, setSchema: Function) => {
  try {
    const credDef = JSON.parse(localStorage.getItem('credDef')!)
    setCredentialDefinition([credDef])
    await getSchema(agent, credDef.schemaId, setSchema)
  } catch (e) {
    console.error(e)
  }
}

// Retrieves the schema
const getSchema = async (agent: Agent, id: string, setSchema: Function) => {
  try {
    // @ts-ignore
    const request = await window.indy.buildGetTxnRequest(null, null, +id)
    // @ts-ignore
    const ledgerResponse = await window.indy.submitRequest(
      // @ts-ignore
      await agent.ledger.ledgerService.getPoolHandle(),
      request
    )
    //@ts-ignore
    const schemaId = ledgerResponse.result.data.txnMetadata.txnId
    setSchema(await agent.ledger.getSchema(schemaId))
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
const acceptOffer = async (agent: Agent, id: string, setCredential?: Function) => {
  try {
    const credentialRecord = await agent.credentials.acceptOffer(id)
    if (setCredential) {
      setCredential(credentialRecord)
    }
  } catch (e) {
    console.error(e)
  }
}

// Issuer accepts the request
const acceptRequest = async (agent: Agent, id: string, setCredential?: Function) => {
  try {
    const credentialRecord = await agent.credentials.acceptRequest(id)
    if (setCredential) {
      setCredential(credentialRecord)
    }
  } catch (e) {
    console.error(e)
  }
}

// Holder accepts the credential
const acceptCredential = async (agent: Agent, id: string, setCredential?: Function) => {
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
  const [credentialDefinitions, setCredentialDefinitions] = useState<CredDef[]>([])

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      getCredentials(agent, setCredentials)
      getConnections(agent, setConnections)
      getCredentialDefinition(agent, setCredentialDefinitions, setSchema)
    }
  }, [agent])

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
          <button className="BackButton" onClick={async () => await getCredentials(agent, setCredentials)}>
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
        <button className="NewCredentialButton" onClick={() => setShowNewCredential(true)}>
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

  const [attachment, setAttachment] = useState<{ name: string; attachment: Attachment | undefined }>()
  const [showAttachment, setShowAttachment] = useState<boolean>(false)
  const [credentialObject, setCredentialObject] = useState<CredentialObject>({
    connectionId: props.connections[0].id,
    credentialDefinitionId: props.credentialDefinitions[0].id,
    preview: new CredentialPreview({ attributes: [] }),
  })

  const handleChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    previewKey?: string
  ) => {
    switch (key) {
      case 'connectionId':
        credentialObject.connectionId = e.target.value
        break
      case 'credentialDefinitionId':
        credentialObject.credentialDefinitionId = e.target.value
        break
      case 'preview':
        if (previewKey) {
          const attribute = credentialObject.preview.attributes.find((attr) => attr.name === previewKey)
          if (attribute) {
            attribute.value = e.target.value
          } else {
            credentialObject.preview.attributes.push(
              new CredentialPreviewAttribute({
                name: previewKey,
                value: e.target.value,
              })
            )
          }
        }
        break
      default:
        console.error(`key (${key}) not implemented`)
    }
    setCredentialObject(credentialObject)
  }

  const handleAttachmentChange = async (key: string, e: React.ChangeEvent<any>) => {
    switch (key) {
      case 'name':
        setAttachment({
          name: e.target.value,
          attachment: attachment?.attachment ? attachment.attachment : undefined,
        })
        break
      case 'attachments':
        if (e.target.files) {
          setAttachment({
            name: attachment?.name ? attachment.name : '',
            attachment: new Attachment({
              filename: e.target.files[0].name,
              mimeType: e.target.files[0].type,
              byteCount: e.target.files[0].size,
              lastmodTime: e.target.files[0].lastModified,
              data: new AttachmentData({
                base64: await base64.fromFile(e.target.files![0]),
              }),
            }),
          })
        }
        break
      default:
        console.error(`key (${key}) not implemented`)
    }
  }

  return (
    <div>
      <div className="TitleContainer">
        <h1>New Credential</h1>
        <button className="BackButton" onClick={() => props.setShowNewCredential(false)}>
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
          <br />
          <label>Choose Receiver: </label>
          <select onChange={(e) => handleChange('connectionId', e)}>
            {props.connections.map((connection) => {
              return (
                <option value={connection.id} key={connection.id}>
                  {connection.alias ? `${connection.alias} - ${connection.id} - ${connection.state}` : connection.id}
                </option>
              )
            })}
          </select>
          <br />
          <div>
            <h3>Credential</h3>
            {props.schema.attrNames.map((name) => {
              return (
                <div key={name} className="AttrNameContainer">
                  <input placeholder={name} onChange={(e) => handleChange('preview', e, name)} />
                  <p>or</p>
                  <label className="CustomFileUpload">
                    <input placeholder={'file'} type="file" onChange={(e) => handleChange('preview', e, name)} />
                    Choose file
                  </label>
                </div>
              )
            })}
            <button className="AttachmentButton" onClick={() => setShowAttachment(true)}>
              Add Attachment!
            </button>
            {showAttachment ? (
              <div className="AttrNameContainer">
                <select onChange={(e) => handleAttachmentChange('name', e)}>
                  {props.schema.attrNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <label className="CustomFileUpload">
                  <input type="file" placeholder="name" onChange={(e) => handleAttachmentChange('attachment', e)} />
                  Choose file
                </label>
                <button onClick={() => setShowAttachment(false)}>Cancel</button>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
        <button
          className="NewConnectionButton"
          onClick={() =>
            offerCredential(
              props.agent,
              credentialObject.connectionId,
              credentialObject.preview,
              credentialObject.credentialDefinitionId
            )
          }
        >
          <b>S</b>
        </button>
      </div>
    </div>
  )
}

const Credential: React.FC<CredentialProps> = (props) => {
  return (
    <div>
      <div className="TitleContainer">
        <h1>Credential - {props.credential.state}</h1>
        <button className="BackButton" onClick={() => props.setShowCredential(false)}>
          <b>back</b>
        </button>
      </div>
      <div>
        <br />
        {props.credential.credentialAttributes?.map((attribute) => {
          //Rendering of different MIME-types happens here
          switch (attribute.mimeType) {
            case 'image/png':
              return (
                <div className="KeyValueContainer" key={attribute.name}>
                  <b className="Key">{attribute.name}</b>
                  <img src={attribute.value} alt={attribute.name}></img>
                </div>
              )
            case 'application/pdf':
              return (
                <div className="KeyValueContainer" key={attribute.name}>
                  <b className="Key">{attribute.name}</b>
                  <embed src={attribute.value}></embed>
                </div>
              )
            default:
              return (
                <div className="KeyValueContainer" key={attribute.name}>
                  <b className="Key">{attribute.name}</b>
                  <p className="Value">{attribute.value}</p>
                </div>
              )
          }
        })}
        <h3>Metadata</h3>
        {Object.entries(props.credential)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => {
            return (
              <div key={key} className="KeyValueContainer">
                <b className="Key">{key}</b>
                <p className="Value">{value}</p>
              </div>
            )
          })}
      </div>
      <button
        className="NewConnectionButton"
        onClick={() => {
          switch (props.credential.state) {
            case 'offer-received':
              acceptOffer(props.agent, props.credential.id, props.setCredential)
              break
            case 'request-received':
              acceptRequest(props.agent, props.credential.id, props.setCredential)
              break
            case 'credential-received':
              acceptCredential(props.agent, props.credential.id, props.setCredential)
              break
            default:
              console.error(`state (${props.credential.state}) is not supported yet!`)
          }
        }}
      >
        <b>A</b>
      </button>
    </div>
  )
}

export default Credentials
