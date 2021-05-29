import { Agent } from 'aries-framework'
import { CredentialDefinitionTemplate, SchemaTemplate } from 'aries-framework/build/src/modules/ledger/services'
import { CredDef, Schema } from 'indy-sdk'
import React, { useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Schema.scss'

const schemaTemplate: SchemaTemplate = {
  name: `demoSchema#${Date.now()}`,
  version: '1.0.1',
  attributes: ['name', 'surname', 'profilePicture'],
}

const createSchema = async (agent: Agent, setSchema: Function) => {
  const schema = await agent.ledger.registerSchema(schemaTemplate)
  //TODO: display
  console.log(schema)
  setSchema(schema)
}

const createCredentialDefinition = async (agent: Agent, schema: Schema, setCredentialDefinition: Function) => {
  const credentialDefinitionTemplate: CredentialDefinitionTemplate = {
    schema,
    tag: 'tag',
    signatureType: 'CL',
    supportRevocation: false,
  }

  const credDef = await agent.ledger.registerCredentialDefinition(credentialDefinitionTemplate)
  localStorage.setItem('credDef', JSON.stringify(credDef))
  //TODO: display
  console.log('CredentialDefinition made!')
  setCredentialDefinition(credDef)
}

const SchemaComponent: React.FC = () => {
  const [schema, setSchema] = useState<Schema>()
  const [, setCredentialDefinition] = useState<CredDef>()

  const { agent } = useAgent()

  return agent ? (
    <div className="SchemaContainer">
      <h1>Schemas</h1>
      <button onClick={() => createSchema(agent, setSchema)}>Create Schema!</button>
      <button onClick={() => createCredentialDefinition(agent, schema!, setCredentialDefinition)}>
        Create Credential Definition!
      </button>
    </div>
  ) : (
    <div>
      <h1>Loading!</h1>
    </div>
  )
}

export default SchemaComponent
