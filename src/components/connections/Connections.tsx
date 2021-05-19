import { ConnectionInvitationMessage, ConnectionRecord } from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { getConnections, createConnection, receiveConnection } from '../../utils/connections'
import QrCode from 'qrcode.react'
import './Connections.scss'

type ConnectionProps = {
  connection: ConnectionRecord
  setConnection: Function
}

type ConnectionsProps = {
  connections: ConnectionRecord[]
  setConnection: Function
}

type NewConnectionProps = {
  conn: NewConnectionObject
  setCreateNewConnection: Function
  setConn: Function
  setInvitation: Function
  invitation: ConnectionInvitationMessage
}

type ReceiveConnectionProps = {
  setReceiveNewConnection: Function
  setReceiveConnection: Function
  receiveConnection: string
}

type NewConnectionObject = {
  autoAcceptConnection: boolean
  alias: string
}

const Connections: React.FC = () => {
  const [connections, setConnections] = useState([] as Array<ConnectionRecord>)
  const [connection, setConnection] = useState({} as ConnectionRecord)
  const [conn, setConn] = useState({ alias: '', autoAcceptConnection: false } as NewConnectionObject)
  const [createNewConnection, setCreateNewConnection] = useState(false)
  const [receiveNewConnection, setReceiveNewConnection] = useState(false)
  const [receiveConnection, setReceiveConnection] = useState('')
  const [invitation, setInvitation] = useState({} as ConnectionInvitationMessage)

  useEffect(() => {
    if (connections.length === 0) {
      retreiveConnections()
    }
  })

  const retreiveConnections = async () => {
    setConnections(await getConnections())
  }

  if (!createNewConnection && !receiveNewConnection) {
    return (
      <div className="ConnectionsContainer">
        {connection?.did ? (
          <Connection connection={connection} setConnection={setConnection} />
        ) : (
          <ConnectionsList connections={connections} setConnection={setConnection} />
        )}
        <button
          className="NewConnectionButton"
          onClick={() => NewConnection({ setCreateNewConnection, conn, setConn, setInvitation, invitation })}
        >
          +
        </button>
        <button
          className="ReceiveConnectionButton"
          onClick={() => ReceiveConnection({ setReceiveNewConnection, setReceiveConnection, receiveConnection })}
        >
          +
        </button>
      </div>
    )
  } else if (createNewConnection && !receiveNewConnection) {
    return (
      <NewConnection
        setCreateNewConnection={setCreateNewConnection}
        conn={conn}
        setConn={setConn}
        setInvitation={setInvitation}
        invitation={invitation}
      />
    )
  } else if (receiveNewConnection && !createNewConnection) {
    return (
      <ReceiveConnection
        setReceiveNewConnection={setReceiveNewConnection}
        setReceiveConnection={setReceiveConnection}
        receiveConnection={receiveConnection}
      />
    )
  } else {
    return (
      <div>
        <h1>System is broken</h1>
      </div>
    )
  }
}

const ConnectionsList: React.FC<ConnectionsProps> = ({ connections, setConnection }) => {
  return (
    <ul className="ConnectionsList">
      {connections.map((connection, key) => {
        return (
          <li key={key}>
            <button
              className="ConnectionButton"
              onClick={() => {
                setConnection(connection)
              }}
            >
              {connection.alias ? connection.alias + ' - ' : ''}
              {connection.id}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const Connection: React.FC<ConnectionProps> = ({ connection, setConnection }) => {
  return (
    <div className="ConnectionContainer">
      <button onClick={() => setConnection({} as ConnectionRecord)}>Back</button>
      <h1>{connection.alias}</h1>
      {Object.entries(connection)
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

const NewConnection: React.FC<NewConnectionProps> = ({
  setCreateNewConnection,
  conn,
  setConn,
  setInvitation,
  invitation,
}) => {
  setCreateNewConnection(true)
  return (
    <div className="ConnectionNewContainer">
      <button
        className="ConnectionBackButton"
        onClick={() => {
          setCreateNewConnection(false)
          setInvitation({})
        }}
      >
        Back
      </button>
      <h1>Create Connection</h1>
      {invitation?.label ? (
        <p className="InvitationUrl">{Buffer.from(JSON.stringify(invitation)).toString('base64')}</p>
      ) : (
        <div className="Form">
          <input onChange={(e) => handleChange(e, 'alias', setConn, conn)} placeholder={'Alias'} />
          <div>
            <p>Auto Accept Connection</p>
            <select onChange={(e) => handleChange(e, 'autoAcceptConnection', setConn, conn)}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                handleInvitationSubmit(conn, setInvitation)
              }}
            >
              Send!
            </button>
          </div>
        </div>
      )}
      {Object.entries(invitation).map(([key, value]) => {
        return (
          <div className="KeyValueContainer" key={key}>
            <b className="Key">{key}</b>
            <p className="Value">{value}</p>
          </div>
        )
      })}
      {invitation?.label ? (
        <QrCode value={Buffer.from(JSON.stringify(invitation)).toString('base64')} size={256} className="QrCode" />
      ) : (
        <div />
      )}
    </div>
  )
}

const ReceiveConnection: React.FC<ReceiveConnectionProps> = ({
  setReceiveNewConnection,
  setReceiveConnection,
  receiveConnection,
}) => {
  setReceiveNewConnection(true)
  return (
    <div className="ReceiveContainer">
      <button
        className="ConnectionBackButton"
        onClick={() => {
          setReceiveNewConnection(false)
          setReceiveConnection({})
        }}
      >
        Back
      </button>
      <h1>Receive Connection</h1>
      <div className="ReceiveForm">
        <input placeholder={'Connection URL'} onChange={(e) => setReceiveConnection(e.target.value)} />
        <button onClick={() => handleReceieveConnectionSubmit(receiveConnection)}>Send!</button>
      </div>
    </div>
  )
}

const handleInvitationSubmit = async (conn: NewConnectionObject, setInvitation: Function) => {
  const invitation = await createConnection(conn)
  setInvitation(invitation)
}
const handleReceieveConnectionSubmit = async (invitationUrl: string) => {
  await receiveConnection(invitationUrl)
}

const handleChange = (event: any, key: string, setConn: Function, conn: NewConnectionObject) => {
  switch (key) {
    case 'alias':
      conn.alias = event.target.value
      break
    case 'autoAcceptConnection':
      if (event.target.value === 'true') {
        conn.autoAcceptConnection = true
      } else {
        conn.autoAcceptConnection = false
      }
      break
    default:
      break
  }
  setConn(conn)
  console.log(conn)
}

export default Connections
