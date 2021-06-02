import { Agent, ConnectionInvitationMessage, ConnectionRecord } from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FaPlus, FaEnvelope } from 'react-icons/fa'
import { useAgent } from '../../providers/agent'
import './Connections.scss'

type ConnectionConfig = {
  alias: string
  autoAcceptConnection: boolean
}

type ConnectionProps = {
  connection: ConnectionRecord | undefined
  setShowConnection: Function
}

type NewConnectionProps = {
  agent: Agent
  setShowNewConnection: Function
}

type ReceiveConnectionProps = {
  agent: Agent
  setShowReceiveConnection: Function
}

const getConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent!.connections.getAll())
}

const createConnection = async (agent: Agent, config?: ConnectionConfig) => {
  return await agent.connections.createConnection(config)
}

const receiveConnection = async (
  agent: Agent,
  invitation: ConnectionInvitationMessage | string,
  config: ConnectionConfig = {
    alias: 'INVITEE',
    autoAcceptConnection: true,
  }
) => {
  if (typeof invitation == 'string') {
    await agent.connections.receiveInvitationFromUrl(invitation, config).catch((e) => console.error(e))
  } else {
    await agent!.connections.receiveInvitation(invitation, config).catch((e) => {
      console.error(e)
    })
  }
}

const Connections: React.FC = (): React.ReactElement => {
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [connection, setConnection] = useState<ConnectionRecord>()
  const [showConnection, setShowConnection] = useState<boolean>(false)
  const [showNewConnection, setShowNewConnection] = useState<boolean>(false)
  const [showReceiveConnection, setShowReceiveConnection] = useState<boolean>(false)

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      getConnections(agent, setConnections)
    }
  }, [agent])

  const loadConnection = (conn: ConnectionRecord) => {
    setConnection(conn)
    setShowConnection(true)
  }

  return agent ? (
    showConnection ? (
      <Connection connection={connection} setShowConnection={setShowConnection} />
    ) : showNewConnection ? (
      <NewConnection agent={agent} setShowNewConnection={setShowNewConnection} />
    ) : showReceiveConnection ? (
      <ReceiveConnection agent={agent} setShowReceiveConnection={setShowReceiveConnection} />
    ) : (
      <div className={'ConnectionContainer'}>
        <div className="TitleContainer">
          <h1>Connections</h1>
          <button className="BackButton" onClick={async () => await getConnections(agent, setConnections)}>
            <b>Refresh</b>
          </button>
        </div>
        <ul className={'ConnectionsList'}>
          {connections.map((conn) => {
            return (
              <li
                className={'ConnectionsItem'}
                key={conn.id}
                onClick={() => {
                  loadConnection(conn)
                }}
              >
                <b>{conn.alias ? conn.alias : ''}</b>
                <p>{conn.state}</p>
                <p>{conn.id}</p>
              </li>
            )
          })}
        </ul>
        <button className="NewConnectionButton" onClick={() => setShowNewConnection(true)}>
          <FaPlus />
        </button>
        <button className="ReceiveConnectionButton" onClick={() => setShowReceiveConnection(true)}>
          <FaEnvelope />
        </button>
      </div>
    )
  ) : (
    <div className={'ConnectionContainer'}>
      <h1>Loading!</h1>
    </div>
  )
}

const Connection: React.FC<ConnectionProps> = (props): React.ReactElement => {
  return (
    <div>
      <div className="TitleContainer">
        <h1>{props.connection?.alias ? props.connection.alias : 'No alias'}</h1>
        <button className="BackButton" onClick={() => props.setShowConnection(false)}>
          <b>back</b>
        </button>
      </div>
      {Object.entries(props.connection!)
        .filter(([key, value]) => key !== 'alias' && typeof value === 'string')
        .map(([key, value]) => {
          return (
            <div className="KeyValueContainer" key={key}>
              <b className="Key">{key.startsWith('_') ? key.substring(1) : key}</b>
              <p className="Value">{value}</p>
            </div>
          )
        })}
    </div>
  )
}

const NewConnection: React.FC<NewConnectionProps> = (props) => {
  const [config, setConfig] = useState<ConnectionConfig>({
    alias: 'INVITER',
    autoAcceptConnection: true,
  })
  const [invitation, setInvitation] = useState<ConnectionInvitationMessage>()
  const [copied, setCopied] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => {
    switch (name) {
      case 'alias':
        setConfig({
          alias: e.target.value,
          autoAcceptConnection: config?.autoAcceptConnection,
        })
        break
      case 'autoAcceptConnection':
        setConfig({
          alias: config.alias,
          autoAcceptConnection: e.target.value === 'true' ? true : false,
        })
        break
      default:
        console.error('Wrong info!')
    }
  }

  const showConnection = async (agent: Agent, config: ConnectionConfig) => {
    const { invitation } = await createConnection(agent, config)
    setInvitation(invitation)
  }

  return (
    <div style={{ height: '100%' }}>
      <div className="TitleContainer">
        <h1>New Connection</h1>
        <button className="BackButton" onClick={() => props.setShowNewConnection(false)}>
          <b>Back</b>
        </button>
      </div>
      <div className="InvitationForm">
        <input onChange={(e) => handleChange(e, 'alias')} placeholder={'Alias'} />
        <div className="AutoAccept">
          <b>Auto Accept Connection</b>
          <select onChange={(e) => handleChange(e, 'autoAcceptConnection')}>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
        <button onClick={() => showConnection(props.agent, config)}>Create!</button>
        {invitation ? (
          Object.entries(invitation).map(([key, value]) => {
            return (
              <p key={key}>
                {key} - {value}
              </p>
            )
          })
        ) : (
          <div />
        )}
        {invitation ? (
          <CopyToClipboard text={invitation.toUrl()} onCopy={() => setCopied(true)}>
            {copied ? <span>Copied to clipboard!</span> : <span>Copy to clipboard!</span>}
          </CopyToClipboard>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

const ReceiveConnection: React.FC<ReceiveConnectionProps> = (props) => {
  const [invitationUrl, setInvitationUrl] = useState<string>()
  const [name, setName] = useState<string>('INVITEE')

  return (
    <div style={{ height: '100%' }}>
      <div className="TitleContainer">
        <h1>Receive Connection</h1>
        <button className="BackButton" onClick={() => props.setShowReceiveConnection(false)}>
          <b>back</b>
        </button>
      </div>
      <div className="ReceiveForm">
        <input placeholder="alias" onChange={(e) => setName(e.target.value)} />
        <input placeholder={'Invitation'} onChange={(e) => setInvitationUrl(e.target.value)} />
        <button
          onClick={() => receiveConnection(props.agent, invitationUrl!, { alias: name, autoAcceptConnection: true })}
        >
          Receive!
        </button>
      </div>
    </div>
  )
}

export default Connections
