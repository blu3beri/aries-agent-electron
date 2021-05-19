import { CredentialRecord } from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { getCredentials } from '../../utils/credentials'
import './Credentials.scss'

const Credentials: React.FC = () => {
  const [credentials, setCredentials] = useState([] as Array<CredentialRecord>)

  useEffect(() => {
    if (credentials.length === 0) {
      retreiveCredentials()
    }
  })

  const retreiveCredentials = async () => {
    setCredentials(await getCredentials())
  }

  return (
    <div className="credentialsContainer">
      <ul>
        {credentials.map((item, key) => {
          return <li key={key}>{item.id}</li>
        })}
      </ul>
    </div>
  )
}

export default Credentials
