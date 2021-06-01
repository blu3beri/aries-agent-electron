import {
  Agent,
  AttributeFilter,
  ConnectionRecord,
  CredentialRecord,
  ProofAttributeInfo,
  ProofRecord,
  ProofRequest,
  RequestedAttribute,
  RequestedCredentials,
} from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Proofs.scss'

// @ts-ignore
// window.indy.setLogger(function (level, target, message, modulePath, file, line) {
//   console.log('libindy said:', level, target, message, modulePath, file, line)
// })

type NewProofProps = {
  agent: Agent
  setShowNewProof: Function
  connections: ConnectionRecord[]
}

type ProofProps = {
  agent: Agent
  proof: ProofRecord
  setProof: Function
  setShowProof: Function
}

const requestProof = async (
  agent: Agent,
  connectionId: string,
  proofRequestOptions: Partial<Pick<ProofRequest, 'name' | 'nonce' | 'requestedAttributes' | 'requestedPredicates'>>
) => {
  await agent.proofs.requestProof(connectionId, proofRequestOptions)
}

const acceptProofRequest = async (
  agent: Agent,
  proofRecordId: string,
  requestedAttributes: Record<string, RequestedAttribute>,
  setProof: Function
) => {
  const requestedCredentials = new RequestedCredentials({
    requestedAttributes,
  })
  setProof(await agent.proofs.acceptRequest(proofRecordId, requestedCredentials))
}

const acceptProofPresentation = async (agent: Agent, proofRecordId: string, setProof: Function) => {
  setProof(await agent.proofs.acceptPresentation(proofRecordId))
}

const getConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent.connections.getAll())
}

const getProofs = async (agent: Agent, setProofs: Function) => {
  setProofs(await agent.proofs.getAll())
}

const getCredentials = async (agent: Agent, setCredentials: Function) => {
  setCredentials(await agent.credentials.getAll())
}

const Proofs: React.FC = () => {
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [showNewProof, setShowNewProof] = useState<boolean>(false)
  const [showProof, setShowProof] = useState<boolean>(false)
  const [proof, setProof] = useState<ProofRecord>()
  const [connections, setConnections] = useState<ConnectionRecord[]>()

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      getProofs(agent, setProofs)
      getConnections(agent, setConnections)
    }
  }, [agent])

  const loadProof = (prf: ProofRecord) => {
    setProof(prf)
    setShowProof(true)
  }

  return agent ? (
    showNewProof ? (
      <NewProof setShowNewProof={setShowNewProof} connections={connections!} agent={agent} />
    ) : showProof ? (
      <Proof agent={agent} proof={proof!} setProof={setProof} setShowProof={setShowProof} />
    ) : (
      <div>
        <div className="TitleContainer">
          <h1>Proofs</h1>
          <button className="BackButton" onClick={async () => await getProofs(agent, setProofs)}>
            <b>Refresh</b>
          </button>
        </div>
        <ul className={'CredentialsList'}>
          {proofs.map((proof) => {
            return (
              <li
                className={'CredentialsItem'}
                key={proof.id}
                onClick={() => {
                  loadProof(proof)
                }}
              >
                <b>{proof.state}</b>
                <p>{proof.connectionId}</p>
              </li>
            )
          })}
        </ul>
        <button className="NewCredentialButton" onClick={() => setShowNewProof(true)}>
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

const NewProof: React.FC<NewProofProps> = (props) => {
  let connectionId = ''
  const attributes = { 0: '', 1: '', 2: '' }

  const handleChange = (key: string, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    switch (key) {
      case 'connectionId':
        connectionId = e.target.value
        break
      case 'attr1':
        attributes[0] = e.target.value
        break
      case 'attr2':
        attributes[1] = e.target.value
        break
      case 'attr3':
        attributes[2] = e.target.value
        break
      default:
        console.error(`key (${key}) not implemented`)
    }
  }

  const sendProofRequest = async (credDefId: string) => {
    const requestedAttributes: Record<string, ProofAttributeInfo> = {}
    Object.values(attributes).forEach((attribute) => {
      requestedAttributes[attribute] = new ProofAttributeInfo({
        name: attribute,
        restrictions: [new AttributeFilter({ credentialDefinitionId: credDefId })],
      })
    })
    try {
      console.log(requestedAttributes)
      await requestProof(props.agent, connectionId, { requestedAttributes })
    } catch (e) {
      throw new Error(e)
    }
  }

  const credDef = JSON.parse(localStorage.getItem('credDef')!)
  return (
    <div>
      <div className="TitleContainer">
        <h1>New Proof request</h1>
        <button className="BackButton" onClick={() => props.setShowNewProof(false)}>
          <b>back</b>
        </button>
      </div>
      <select onChange={(e) => handleChange('connectionId', e)}>
        {props.connections.map((connection) => {
          return (
            <option value={connection.id} key={connection.id}>
              {connection.alias ? `${connection.alias} - ${connection.id} - ${connection.state}` : connection.id}
            </option>
          )
        })}
      </select>
      <input type="text" placeholder={'Attribute'} onChange={(e) => handleChange('attr1', e)} />
      <input type="text" placeholder={'Attribute'} onChange={(e) => handleChange('attr2', e)} />
      <input type="text" placeholder={'Attribute'} onChange={(e) => handleChange('attr3', e)} />
      <button onClick={async () => await sendProofRequest(credDef.id)}>Send!</button>
    </div>
  )
}

const Proof: React.FC<ProofProps> = (props) => {
  const [credentials, setCredentials] = useState<CredentialRecord[]>([])

  const requestedAttributes = props.proof.requestMessage?.indyProofRequest?.requestedAttributes
  const requestedProofs = props.proof.presentationMessage?.indyProof?.requested_proof.revealed_attrs
  const attributes: { name: string; value?: string }[] = []

  console.log(props.proof)

  useEffect(() => {
    getCredentials(props.agent, setCredentials)
  }, [props.agent])

  if (requestedAttributes && !requestedProofs) {
    Object.entries(requestedAttributes).forEach(([, value]) => {
      if (value.name) {
        attributes.push({ name: value.name })
      } else {
        value.names?.forEach((name) => {
          attributes.push({ name })
        })
      }
    })
  } else if (requestedProofs) {
    Object.entries(requestedProofs).forEach(([key, value]) => {
      attributes.push({ name: key, value: value.raw })
    })
  }

  return (
    <div>
      <div className="TitleContainer">
        <h1>Proof - {props.proof.state}</h1>
        <button className="BackButton" onClick={() => props.setShowProof(false)}>
          <b>back</b>
        </button>
      </div>
      <div>
        <h3>Requested Attributes</h3>
        {attributes.map((attribute) => {
          const attachments = props.proof.presentationMessage?.attachments
          const attach =
            attachments && attachments.find((attachment) => attachment.id === attribute.value)
              ? attachments.find((attachment) => attachment.id === attribute.value)
              : undefined
          return (
            <div className="KeyValueContainer" key={attribute.name}>
              <b className="Key">{attribute.name.startsWith('_') ? attribute.name.substring(1) : attribute.name}</b>
              {attach ? (
                <img src={attach.data.base64} alt={attribute.name} />
              ) : (
                <p className="Value">{attribute.value}</p>
              )}
            </div>
          )
        })}
      </div>
      <h3>Metadata</h3>
      {Object.entries(props.proof!)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => {
          return (
            <div className="KeyValueContainer" key={key}>
              <b className="Key">{key.startsWith('_') ? key.substring(1) : key}</b>
              <p className="Value">{value}</p>
            </div>
          )
        })}
      <button
        className="NewConnectionButton"
        onClick={async () => {
          switch (props.proof.state) {
            case 'request-received':
              const proofInfoNames = Object.keys(props.proof.requestMessage!.indyProofRequest!.requestedAttributes)
              let credentialId: string
              credentials.forEach((credentialRecord) => {
                credentialRecord.credentialAttributes!.forEach((attribute) => {
                  if (proofInfoNames.includes(attribute.name)) {
                    credentialId = credentialRecord.credentialId!
                  } else {
                    return undefined
                  }
                })
              })

              const requestedAttributes: Record<string, RequestedAttribute> = {}

              proofInfoNames.forEach((name) => {
                requestedAttributes[name] = new RequestedAttribute({ credentialId, revealed: true })
              })

              acceptProofRequest(props.agent, props.proof.id, requestedAttributes, props.setProof)
              break
            case 'presentation-received':
              acceptProofPresentation(props.agent, props.proof.id, props.setProof)
              break
            default:
              console.error(`state (${props.proof.state}) is not supported yet!`)
          }
        }}
      >
        <b>A</b>
      </button>
    </div>
  )
}

export default Proofs
