import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  ObjectType,
  Ctx,
  UseMiddleware,
  Int,
} from 'type-graphql'
import { hash, compare } from 'bcryptjs'
import { User } from './entity/User'
import { MyContext } from './MyContext'
import { createRefreshToken, createAccessToken } from './auth'
import { isAuth } from './isAuth'
import { sendRefreshToken } from './sendRefreshToken'
import { getConnection } from 'typeorm'
import { verify } from 'jsonwebtoken'

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string
  @Field(() => User)
  user: User
}

@Resolver()
export class UserResolver {
  /**
   * Testing query
   */
  @Query(() => String)
  hello() {
    return 'Hi'
  }

  /**
   * Check that the user is authenticated
   */
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    console.log(payload)
    return `Your user id is: ${payload!.userId}`
  }

  /**
   * Query all users
   */
  @Query(() => [User])
  users() {
    return User.find()
  }

  /**
   * Query currently logged in user
   */
  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers['authorization']

    if (!authorization) {
      return null
    }

    try {
      const token = authorization.split(' ')[1]
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
      context.payload = payload as any
      return User.findOne(payload.userId)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  /**
   * Register new user
   */
  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12)

    try {
      await User.insert({
        email,
        password: hashedPassword,
      })
    } catch (err) {
      console.error(err)
      return false
    }

    return true
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1)

    return true
  }

  /**
   * Login user
   */
  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw new Error(`Could not find user with email: ${email}`)
    }

    const valid = await compare(password, user.password)
    if (!valid) {
      throw new Error('Incorrect password')
    }

    // Login success
    sendRefreshToken(res, createRefreshToken(user))

    return {
      accessToken: createAccessToken(user),
      user,
    }
  }

  /**
   * Logout user
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, '')

    return true
  }
}
