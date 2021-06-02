import React from 'react'
import './Default.scss'

const Default: React.FC = () => {
  return (
    <div className="ContainerDefault">
      <h1>Hyperledger Aries Agent</h1>
      <p>
        Fully supports:<b> Holder, Issuer and Verifier </b>
      </p>
      <p>Created By: Berend Sliedrecht</p>
      <p>For: Animo Solutions</p>
    </div>
  )
}

export default Default
