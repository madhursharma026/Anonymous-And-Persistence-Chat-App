// pages/_app.js
import client from '@/lib/apollo-client'
import { ApolloProvider } from '@apollo/client'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  )
}
