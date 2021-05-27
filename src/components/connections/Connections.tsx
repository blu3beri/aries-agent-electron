import {
  Agent,
  ConnectionInvitationMessage,
  ConnectionRecord,
} from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Connections.scss'

const fetchConnections = async (agent: Agent, setConnections: Function) => {
  setConnections(await agent!.connections.getAll())
}

type ConnectionsProps = {
  connections: ConnectionRecord[]
  setConnections: Function
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

const createConnection = async (
  agent: Agent,
  config?: { alias: string; autoAcceptConnection: boolean }
) => {
  return await agent!.connections.createConnection(config)
}

const receiveConnection = async (
  agent: Agent,
  invitation: ConnectionInvitationMessage | string,
  connectionsProps?: ConnectionsProps,
  config: { alias: string; autoAcceptConnection: boolean } = {
    alias: 'INVITEE',
    autoAcceptConnection: true,
  }
) => {
  if (typeof invitation == 'string') {
    await agent.connections
      .receiveInvitationFromUrl(invitation, config)
      .catch((e) => console.error(e))
  } else {
    const connectionRecord = await agent!.connections.receiveInvitation(
      invitation,
      config
    )
    if (connectionsProps) {
      connectionsProps.setConnections([
        ...connectionsProps.connections,
        connectionRecord,
      ])
    }
  }
}

const Connections: React.FC = (): React.ReactElement => {
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [connection, setConnection] = useState<ConnectionRecord>()
  const [showConnection, setShowConnection] = useState<boolean>(false)
  const [showNewConnection, setShowNewConnection] = useState<boolean>(false)
  const [showReceiveConnection, setShowReceiveConnection] =
    useState<boolean>(false)

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      fetchConnections(agent, setConnections)
    }
  }, [agent])

  const loadConnection = (conn: ConnectionRecord) => {
    setConnection(conn)
    setShowConnection(true)
  }

  const refreshConnections = async () => {
    setConnections([])
    await fetchConnections(agent!, setConnections)
  }

  return agent ? (
    showConnection ? (
      <Connection
        connection={connection}
        setShowConnection={setShowConnection}
      />
    ) : showNewConnection ? (
      <NewConnection
        agent={agent}
        setShowNewConnection={setShowNewConnection}
      />
    ) : showReceiveConnection ? (
      <ReceiveConnection
        agent={agent}
        setShowReceiveConnection={setShowReceiveConnection}
      />
    ) : (
      <div className={'ConnectionContainer'}>
        <div className="TitleContainer">
          <h1>Connections</h1>
          <button className="BackButton" onClick={() => refreshConnections()}>
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
        <button
          className="NewConnectionButton"
          onClick={() => setShowNewConnection(true)}
        >
          <b>+</b>
        </button>
        <button
          className="ReceiveConnectionButton"
          onClick={() => setShowReceiveConnection(true)}
        >
          <b>R</b>
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
  console.log(props)
  return (
    <div>
      <div className="TitleContainer">
        <h1>{props.connection?.alias ? props.connection.alias : 'No alias'}</h1>
        <button
          className="BackButton"
          onClick={() => props.setShowConnection(false)}
        >
          <b>back</b>
        </button>
      </div>
      {Object.entries(props.connection!)
        .filter(([key, value]) => key !== 'alias' && typeof value === 'string')
        .map(([key, value]) => {
          return (
            <div className="KeyValueContainer" key={key}>
              <b className="Key">
                {key.startsWith('_') ? key.substring(1) : key}
              </b>
              <p className="Value">{value}</p>
            </div>
          )
        })}
    </div>
  )
}

const NewConnection: React.FC<NewConnectionProps> = (props) => {
  const [invitationUrl, setInvitationUrl] = useState<string>()

  const [config, setConfig] = useState<{
    alias: string
    autoAcceptConnection: boolean
  }>({ alias: 'INVITER', autoAcceptConnection: true })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    name: string
  ) => {
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

  const showConnection = async (
    agent: Agent,
    config: { alias: string; autoAcceptConnection: boolean }
  ) => {
    const { invitation } = await createConnection(agent, config)
    console.log(invitation.toUrl())
    setInvitationUrl(invitation.toUrl())
  }

  return (
    <div>
      <div className={'ConnectionContainer'}>
        <div className="TitleContainer">
          <h1>New Connection</h1>
          <button
            className="BackButton"
            onClick={() => props.setShowNewConnection(false)}
          >
            <b>Back</b>
          </button>
        </div>
        <div>
          <div className="Form">
            <input
              onChange={(e) => handleChange(e, 'alias')}
              placeholder={'Alias'}
            />
            <div>
              <p>Auto Accept Connection</p>
              <select onChange={(e) => handleChange(e, 'autoAcceptConnection')}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => showConnection(props.agent, config)}>
        Create!
      </button>
      <p>{invitationUrl}</p>
    </div>
  )
}

const ReceiveConnection: React.FC<ReceiveConnectionProps> = (props) => {
  const [invitationUrl, setInvitationUrl] = useState<string>()

  return (
    <div>
      <div className="TitleContainer">
        <h1>Receive Connection</h1>
        <button
          className="BackButton"
          onClick={() => props.setShowReceiveConnection(false)}
        >
          <b>back</b>
        </button>
      </div>
      <div>
        <input
          placeholder={'Invitation'}
          onChange={(e) => setInvitationUrl(e.target.value)}
        />
        <button onClick={() => receiveConnection(props.agent, invitationUrl!)}>
          Receive!
        </button>
      </div>
    </div>
  )
}

export default Connections
