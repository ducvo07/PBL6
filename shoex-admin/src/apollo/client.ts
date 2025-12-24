import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
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
  link: httpLink, // from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
