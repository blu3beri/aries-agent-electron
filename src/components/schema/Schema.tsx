import { Agent } from 'aries-framework'
import { CredentialDefinitionTemplate, SchemaTemplate } from 'aries-framework/build/src/modules/ledger/services'
import { Schema } from 'indy-sdk'
import React, { useState } from 'react'
import { useAgent } from '../../providers/agent'
import './Schema.scss'

const createSchema = async (agent: Agent, schemaTemplate: SchemaTemplate, attributes: {}) => {
  schemaTemplate.attributes = Object.values(attributes)
  return await agent.ledger.registerSchema(schemaTemplate)
}

const createCredentialDefinition = async (agent: Agent, schema: Schema) => {
  const credentialDefinitionTemplate: CredentialDefinitionTemplate = {
    schema,
    tag: 'tag',
    signatureType: 'CL',
    supportRevocation: false,
  }

  return await agent.ledger.registerCredentialDefinition(credentialDefinitionTemplate).catch((e) => console.error(e))
}

const createSchemaAndDefinition = async (
  agent: Agent,
  schemaTemplate: SchemaTemplate,
  attributes: {},
  setWritten: Function,
  setLoading: Function
) => {
  try {
    setLoading(true)
    const schema = await createSchema(agent, schemaTemplate, attributes)
    const credDef = await createCredentialDefinition(agent, schema)
    localStorage.setItem('credDef', JSON.stringify(credDef))
    setWritten(true)
    setLoading(false)
  } catch (e) {
    console.error(e)
    setLoading(false)
  }
}

const SchemaComponent: React.FC = () => {
  const [written, setWritten] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const schemaTemplate: SchemaTemplate = {
    name: '',
    version: '0.0.1',
    attributes: [],
  }
  const attributes = { 0: '', 1: '', 2: '' }

  const { agent } = useAgent()

  const handleChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    switch (key) {
      case 'name':
        schemaTemplate.name = e.target.value
        break
      case 'version':
        schemaTemplate.version = e.target.value
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

  return agent ? (
    <div className="SchemaContainer">
      <h1>Schemas</h1>
      <div>
        <div className="InputFields">
          <input type="text" placeholder="name" onChange={(e) => handleChange('name', e)} />
          <input type="text" placeholder="version" onChange={(e) => handleChange('version', e)} />
        </div>
        <div className="InputFields">
          <input type="text" placeholder="Attribute 1" onChange={(e) => handleChange('attr1', e)} />
          <input type="text" placeholder="Attribute 2" onChange={(e) => handleChange('attr2', e)} />
          <input type="text" placeholder="Attribute 3" onChange={(e) => handleChange('attr3', e)} />
        </div>
      </div>
      <button
        className="NewCredentialButton"
        onClick={() => createSchemaAndDefinition(agent, schemaTemplate, attributes, setWritten, setLoading)}
      >
        C
      </button>
      <div className="SchemaInformation">
        {loading ? <p>loading</p> : written ? <p>Schema and credential definition have been made!</p> : <div />}
      </div>
    </div>
  ) : (
    <div>
      <h1>Loading!</h1>
    </div>
  )
}

export default SchemaComponent
