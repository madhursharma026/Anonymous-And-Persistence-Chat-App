import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  // uri: 'http://5.39.222.209:8000/graphql',
  uri: 'http://localhost:8000/graphql',
})

const wsLink =
  typeof window !== 'undefined'
    ? new WebSocketLink({
        // uri: 'ws://5.39.222.209:8000/graphql',
        uri: 'ws://localhost:8000/graphql',
        options: {
          reconnect: true,
        },
      })
    : null

const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          )
        },
        wsLink,
        httpLink
      )
    : httpLink

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default client
