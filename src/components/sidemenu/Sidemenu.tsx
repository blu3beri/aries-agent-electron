import React from 'react'
import './Sidemenu.scss'

type Props = {
  componentName: string
  setComponent: Function
}

type ItemProps = Props & {
  name: string
}

const Item: React.FC<ItemProps> = ({ componentName, setComponent, name }) => (
  <li className={`ListItem ${componentName === name ? 'Active' : ''}`} onClick={() => setComponent(name)}>
    <p>{name}</p>
  </li>
)

const Sidemenu: React.FC<Props> = ({ componentName, setComponent }) => (
  <div className="SidemenuContainer">
    <ul className="List">
      <Item componentName={componentName} setComponent={setComponent} name={'connections'} />
      <Item componentName={componentName} setComponent={setComponent} name={'credentials'} />
      <Item componentName={componentName} setComponent={setComponent} name={'proofs'} />
      <Item componentName={componentName} setComponent={setComponent} name={'schemas'} />
    </ul>
  </div>
)

export default Sidemenu
