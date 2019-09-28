import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './UserResolver'
import { createConnection } from 'typeorm'
import cookieParser from 'cookie-parser'
import cors from 'cors'
//
import { verify } from 'jsonwebtoken'
import { User } from './entity/User'
import { createAccessToken, createRefreshToken } from './auth'
import { sendRefreshToken } from './sendRefreshToken'
;(async () => {
  const app = express()
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(cookieParser())

  // Connect to db
  await createConnection()

  app.get('/', (_req, res) => {
    res.send('Hello')
  })

  // Refresh token
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid
    if (!token) {
      return res.send({ ok: false, accessToken: '' })
    }

    let payload: any = null
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
    } catch (err) {
      console.error(err)
      return res.send({ ok: false, accessToken: '' })
    }

    // Token is valid
    const user = await User.findOne({ id: payload.userId })

    if (!user) {
      return res.send({ ok: false, accessToken: '' })
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' })
    }

    sendRefreshToken(res, createRefreshToken(user))

    return res.send({ ok: true, accessToken: createAccessToken(user) })
  })

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  })

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(4000, () => {
    console.log('Server started')
  })
})()
