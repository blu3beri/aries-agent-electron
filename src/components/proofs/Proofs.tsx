import { ProofRecord } from 'aries-framework'
import React, { useEffect, useState } from 'react'
import { getProofs } from '../../utils/proofs'
import './Proofs.scss'

const Proofs: React.FC = () => {
  const [proofs, setProofs] = useState([] as Array<ProofRecord>)

  useEffect(() => {
    if (proofs.length === 0) {
      retreiveProofs()
    }
  })

  const retreiveProofs = async () => {
    setProofs(await getProofs())
  }

  return (
    <div className="ProofsContainer">
      <ul>
        {proofs.map((item, key) => {
          return <li key={key}>{item.id}</li>
        })}
      </ul>
    </div>
  )
}

export default Proofs
