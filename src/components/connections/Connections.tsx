import {
  Agent,
  ConnectionInvitationMessage,
  ConnectionRecord,
} from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Connections.scss'

const fetchConnections = async (agent: Agent, setConnections: Function) => {
  const conns = await agent!.connections.getAll()
  setConnections(conns)
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

const createConnection = async (
  agent: Agent,
  config?: { alias: string; autoAcceptConnection: boolean }
) => {
  const { invitation, connectionRecord } =
    await agent!.connections.createConnection(config)
  return invitation
}

const receiveConnection = async (
  agent: Agent,
  connectionsProps: ConnectionsProps,
  invitation: ConnectionInvitationMessage,
  config?: { alias: string; autoAcceptConnection: boolean }
) => {
  const connectionRecord = await agent!.connections.receiveInvitation(
    invitation,
    config
  )
  connectionsProps.setConnections([
    ...connectionsProps.connections,
    connectionRecord,
  ])
}

const Connections: React.FC = (): React.ReactElement => {
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [connection, setConnection] = useState<ConnectionRecord>()
  const [showConnection, setShowConnection] = useState<boolean>(false)
  const [showNewConnection, setShowNewConnection] = useState<boolean>(false)

  const { agent } = useAgent()

  useEffect(() => {
    if (agent) {
      fetchConnections(agent, setConnections)
    }
  }, [agent])

  const loadConnection = () => {
    setShowConnection(true)
    setConnection(connection)
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
                  loadConnection()
                }}
              >
                <b>{conn.alias ? conn.alias : ''}</b>
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
            <div>
              <button
                onClick={() => {
                  console.log(config)
                }}
              >
                Send!
              </button>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => createConnection(props.agent, config)}>
        Create!
      </button>
    </div>
  )
}

export default Connections
