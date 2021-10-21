import axios from "axios"
import prismaClient from "../prisma"
import { sign } from 'jsonwebtoken'

interface IAuthorizationResponse {
  access_token: string
}

interface IUser {
  avatar_url: string;
  login: string;
  id: number;
  name: string
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "http://github.com/login/oauth/access_token"

    const { data: accessTokenResponse } = await axios.post<IAuthorizationResponse>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        "Accept": "application/json"
      }
    })


    const response = await axios.get<IUser>('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${accessTokenResponse.access_token}`
      }
    })

    const { avatar_url, id, name, login } = response.data

    const user = await prismaClient.user.findFirst({
      where: {
        github_id: id
      }
    })

    if (!user) {
      await prismaClient.user.create({
        data: {
          avatar_url: avatar_url,
          github_id: id,
          login: login,
          name: name
        }
      })
    }

    const token = sign({
      user: {
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id
      }
    },
      process.env.JWT_SECRET, 
    {
      subject: user.id,
      expiresIn: "1d"
    }
    )

    return {token, user}
  }
}

export { AuthenticateUserService }