import React, { useEffect } from 'react'
import initAgent from '../../providers/agent'
import './Default.scss'

const Default: React.FC = () => {
  useEffect(() => {
    initAgent().then((a) => {
      const agent = a
      agent.connections.getAll().then((connections) => {
        console.log(connections)
      })
    })
  }, [])
  return (
    <div className="ContainerDefault">
      <h1>Default!</h1>
    </div>
  )
}

export default Default
