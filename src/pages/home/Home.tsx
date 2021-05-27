import React, { useState } from 'react'
import Connections from '../../components/connections/Connections'
import Credentials from '../../components/credentials/Credentials'
import Default from '../../components/default/Default'
import Proofs from '../../components/proofs/Proofs'
import Schema from '../../components/schema/Schema'
import Sidemenu from '../../components/sidemenu/Sidemenu'
import './Home.scss'

type ComponentProps = {
  name: string
}

const Main: React.FC<ComponentProps> = (props) => {
  switch (props.name.toLowerCase()) {
    case 'connections':
      return <Connections />
    case 'credentials':
      return <Credentials />
    case 'proofs':
      return <Proofs />
    case 'schemas':
      return <Schema />
    default:
      return <Default />
  }
}

const Home: React.FC = () => {
  const [component, setComponent] = useState('')

  return (
    <div className="HomeContainer">
      <Sidemenu setComponent={setComponent} componentName={component} />
      <div className="Main">
        <Main name={component} />
      </div>
    </div>
  )
}

export default Home
