import React from 'react'
import { useRegisterMutation } from '../generated/graphql'
import { RouteComponentProps } from 'react-router'

const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [register] = useRegisterMutation()

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        const res = await register({ variables: { email, password } })

        console.log(res)
        history.push('/')
      }}
    >
      <div>
        <input
          type="email"
          value={email}
          placeholder="email"
          onChange={e => {
            setEmail(e.target.value)
          }}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={e => {
            setPassword(e.target.value)
          }}
        />
      </div>
      <button type="submit">Register</button>
    </form>
  )
}

export default Register
