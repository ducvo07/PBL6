import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        username
        email
        fullName
        role
        isActive
      }
      tokens {
        accessToken
        refreshToken
        expiresIn
      }
      errors {
        username
        password
        general
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`