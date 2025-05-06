import { gql, useMutation, useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'
import AnonymoyousChat from './components/anonymoyous-chats'
import PersistenceChat from './components/persistence-chats'

// GraphQL Mutations
const LOGIN_ANONYMOUS_USER = gql`
  mutation LoginAnonymousUser($userId: String!, $partnerId: String!) {
    loginAnonymousUser(userId: $userId, partnerId: $partnerId)
  }
`

const LOGOUT_ANONYMOUS_USER = gql`
  mutation LogoutAnonymousUser($userId: String!) {
    logoutAnonymousUser(userId: $userId)
  }
`

// GraphQL Subscription
const ANONYMOUS_USER_LOGGED_OUT = gql`
  subscription AnonymousUserLoggedOut($userId: String!) {
    anonymousUserLoggedOut(userId: $userId)
  }
`
const LOGIN_PERSISTENCE_USER = gql`
  mutation LoginUser($userId: String!, $partnerId: String!) {
    loginUser(userId: $userId, partnerId: $partnerId)
  }
`

export default function Home() {
  const [senderId, setSenderId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [startAnonymoyousChat, setStartAnonymoyousChat] = useState(false)
  const [startPersistenceChat, setStartPersistenceChat] = useState(false)

  const [loginAnonymousUser] = useMutation(LOGIN_ANONYMOUS_USER)
  const [loginUser] = useMutation(LOGIN_PERSISTENCE_USER)
  const [logoutUser] = useMutation(LOGOUT_ANONYMOUS_USER)

  const { data: logoutSubData } = useSubscription(ANONYMOUS_USER_LOGGED_OUT, {
    variables: { userId: senderId },
    skip: !(startAnonymoyousChat || startPersistenceChat),
  })

  useEffect(() => {
    if (logoutSubData?.anonymousUserLoggedOut === receiverId) {
      alert('User has logged out. Ending chat.')
      handleLogoutAnonymoyousChat()
    }
  }, [logoutSubData])

  const handleStartAnonymoyousChat = async () => {
    if (senderId.trim() && receiverId.trim()) {
      try {
        await loginAnonymousUser({
          variables: {
            userId: senderId,
            partnerId: receiverId,
          },
        })
        setStartAnonymoyousChat(true)
        setStartPersistenceChat(false)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  const handleLogoutAnonymoyousChat = async () => {
    try {
      await logoutUser({ variables: { userId: senderId } })
    } catch (error) {
      console.error('Logout error:', error.message)
    }
    setSenderId('')
    setReceiverId('')
    setStartAnonymoyousChat(false)
  }

  const handleStartPersistenceChat = async () => {
    if (senderId.trim() && receiverId.trim()) {
      try {
        await loginUser({
          variables: {
            userId: senderId,
            partnerId: receiverId,
          },
        })
        setStartPersistenceChat(true)
        setStartAnonymoyousChat(false)
      } catch (error) {
        alert(error.message)
      }
    }
  }

  const handleLogoutPersistenceChat = () => {
    setSenderId('')
    setReceiverId('')
    setStartPersistenceChat(false)
  }

  return (
    <div className="vh-100 vw-100 d-flex align-items-center justify-content-center bg-light">
      {!startAnonymoyousChat && !startPersistenceChat ? (
        <div
          className="card shadow p-4"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <h2 className="text-center mb-4">Enter User ID and Client ID</h2>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Your User ID"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Client/User ID"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            onClick={handleStartPersistenceChat}
            className="btn btn-primary w-100 mb-3"
          >
            Start Persistence Chat
          </button>
          <button
            onClick={handleStartAnonymoyousChat}
            className="btn btn-secondary w-100"
          >
            Start Anonymous Chat
          </button>
        </div>
      ) : (
        <>
          {startPersistenceChat && (
            <PersistenceChat
              senderId={senderId}
              receiverId={receiverId}
              onLogout={handleLogoutPersistenceChat}
            />
          )}
          {startAnonymoyousChat && (
            <AnonymoyousChat
              senderId={senderId}
              receiverId={receiverId}
              onLogout={handleLogoutAnonymoyousChat}
            />
          )}
        </>
      )}
    </div>
  )
}
