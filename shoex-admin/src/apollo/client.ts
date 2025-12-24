import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'

const uploadLink = createUploadLink({
  uri: 'http://localhost:8000/graphql/', // Adjust if backend is on different port
})

// Temporarily disable auth for products to work
// const authLink = setContext((_, { headers }) => {
//   const token = localStorage.getItem('accessToken')
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : '',
//     },
//   }
// })

export const client = new ApolloClient({
  link: uploadLink, // from([authLink, uploadLink]),
  cache: new InMemoryCache(),
})
