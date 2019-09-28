import React from 'react'
import { useLoginMutation, MeDocument, MeQuery } from '../generated/graphql'
import { RouteComponentProps } from 'react-router'
import { setAccessToken } from '../accessToken'

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [login] = useLoginMutation()

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        const res = await login({
          variables: { email, password },
          update: (store, { data }) => {
            if (!data) {
              return null
            }

            store.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: 'Query',
                me: data.login.user,
              },
            })
          },
        })

        console.log(res)

        if (res && res.data) {
          setAccessToken(res.data.login.accessToken)
        }
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
      <button type="submit">Login</button>
    </form>
  )
}

export default Login
