import React from 'react'
import Routes from './Routes'
import { setAccessToken } from './accessToken'

interface Props {}

const App: React.FC<Props> = () => {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('http://localhost:4000/refresh_token', {
      method: 'post',
      credentials: 'include',
    }).then(async x => {
      const { accessToken } = await x.json()
      setAccessToken(accessToken)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return <Routes />
}

export default App
