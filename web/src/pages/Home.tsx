import React from 'react'
import { useUsersQuery } from '../generated/graphql'

interface Props {}

const Home: React.FC<Props> = () => {
  const { data } = useUsersQuery({ fetchPolicy: 'network-only' })

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div>Users:</div>
      <ul>
        {data.users.map(user => {
          return (
            <li key={user.id}>
              {user.email}, {user.id}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Home
