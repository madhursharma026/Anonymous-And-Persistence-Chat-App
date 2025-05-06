import { gql, useMutation, useQuery, useSubscription } from '@apollo/client'
import Picker from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { RiCheckDoubleLine, RiCheckLine } from 'react-icons/ri'

// GraphQL Queries, Mutations, Subscriptions
const GET_MESSAGES = gql`
  query GetMessages($sender_id: String!, $receiver_id: String!) {
    getMessages(sender_id: $sender_id, receiver_id: $receiver_id) {
      id
      sender_id
      receiver_id
      content
      timestamp
      isRead
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendMessage($createMessageInput: CreatePersistenceMessageInput!) {
    sendMessage(createMessageInput: $createMessageInput) {
      id
      sender_id
      receiver_id
      content
      timestamp
      isRead
    }
  }
`

const MARK_AS_READ = gql`
  mutation MarkAsRead($messageId: Float!) {
    markAsRead(messageId: $messageId) {
      id
      isRead
    }
  }
`

const MESSAGE_SENT = gql`
  subscription MessageSent($sender_id: String!, $receiver_id: String!) {
    messageSent(sender_id: $sender_id, receiver_id: $receiver_id) {
      id
      sender_id
      receiver_id
      content
      timestamp
      isRead
    }
  }
`

const MESSAGE_READ = gql`
  subscription MessageRead($sender_id: String!, $receiver_id: String!) {
    messageRead(sender_id: $sender_id, receiver_id: $receiver_id) {
      id
      sender_id
      receiver_id
      isRead
    }
  }
`

export default function PersistenceChat({ senderId, receiverId, onLogout }) {
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [gifs, setGifs] = useState([])
  const [selectedGif, setSelectedGif] = useState(null)
  const bottomRef = useRef(null)

  const { data: initialMessagesData } = useQuery(GET_MESSAGES, {
    variables: { sender_id: senderId, receiver_id: receiverId },
  })

  const [sendMessage] = useMutation(SEND_MESSAGE)
  const [markAsRead] = useMutation(MARK_AS_READ)

  const { data: sentData } = useSubscription(MESSAGE_SENT, {
    variables: { sender_id: senderId, receiver_id: receiverId },
  })

  const { data: readData } = useSubscription(MESSAGE_READ, {
    variables: { sender_id: senderId, receiver_id: receiverId },
  })

  // Set initial messages
  useEffect(() => {
    if (initialMessagesData?.getMessages) {
      setMessages(initialMessagesData.getMessages)
    }
  }, [initialMessagesData])

  // Handle new sent messages
  useEffect(() => {
    if (sentData?.messageSent) {
      const newMessage = sentData.messageSent
      setMessages((prev) => [...prev, newMessage])

      if (
        document.visibilityState === 'visible' &&
        newMessage.sender_id !== senderId &&
        !newMessage.isRead
      ) {
        handleMarkAsRead(newMessage.id)
      }
    }
  }, [sentData])

  // Handle messageRead event (update isRead status)
  useEffect(() => {
    if (readData?.messageRead) {
      const updatedMsg = readData.messageRead
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMsg.id ? { ...msg, isRead: true } : msg
        )
      )
    }
  }, [readData])

  const handleSend = async () => {
    const contentToSend = selectedGif
      ? selectedGif.images.original.url
      : messageInput.trim()

    if (!contentToSend) return

    try {
      await sendMessage({
        variables: {
          createMessageInput: {
            sender_id: senderId,
            receiver_id: receiverId,
            content: contentToSend,
          },
        },
      })
      setMessageInput('')
      setSelectedGif(null)
      setShowGifPicker(false)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Message failed to send. Please try again.')
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead({ variables: { messageId } })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Auto-mark unread messages as read when tab is active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        messages.forEach((msg) => {
          if (msg.sender_id !== senderId && !msg.isRead) {
            handleMarkAsRead(msg.id)
          }
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEmojiClick = (emoji) => {
    setMessageInput((prev) => prev + emoji.emoji)
    setShowEmojiPicker(false)
    document.getElementById('messageInput').focus()
  }

  const fetchGifs = async (query) => {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=zvQZytJbGlBrLKjhzVWEb0vl7nnFiyKm&q=${query}&limit=15&rating=g`
    )
    const data = await res.json()
    setGifs(data.data)
  }

  const isGifUrl = (url) =>
    typeof url === 'string' &&
    (url.endsWith('.gif') || url.includes('giphy.com/media'))

  return (
    <div className="vh-100 vw-100 d-flex flex-column bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white shadow-sm">
        <div className="fw-bold fs-5">
          {senderId} ↔ {receiverId}
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ backgroundColor: '#e5ddd5' }}
      >
        <div className="d-flex flex-column gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex ${
                msg.sender_id === senderId
                  ? 'justify-content-end'
                  : 'justify-content-start'
              }`}
            >
              <div
                className={`p-2 rounded position-relative shadow-sm ${
                  msg.sender_id === senderId
                    ? 'bg-primary text-white'
                    : 'bg-white text-dark'
                }`}
                style={{
                  maxWidth: '75%',
                  minWidth: '100px',
                  wordBreak: 'break-word',
                  fontSize: '15px',
                  lineHeight: '1.4',
                }}
              >
                {isGifUrl(msg.content) ? (
                  <img
                    src={msg.content}
                    alt="GIF"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <div className="mb-1">{msg.content}</div>
                )}
                <div className="d-flex justify-content-end align-items-center gap-1 small opacity-75 mt-1">
                  <span style={{ fontSize: '11px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.sender_id === senderId && (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'white',
                        marginLeft: '5px',
                      }}
                    >
                      {msg.isRead ? <RiCheckDoubleLine /> : <RiCheckLine />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-top p-3 bg-white position-relative">
        {selectedGif ? (
          <div className="d-flex flex-column align-items-center gap-3 p-3 border rounded shadow-sm bg-white">
            <div
              style={{
                width: '100%',
                maxWidth: '320px',
                height: 'auto',
                position: 'relative',
              }}
            >
              <img
                src={selectedGif.images.fixed_height.url}
                alt="Selected GIF"
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
            </div>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-danger px-4"
                style={{ borderRadius: '20px' }}
                onClick={() => setSelectedGif(null)}
              >
                Discard
              </button>
              <button
                className="btn btn-success px-4"
                style={{ borderRadius: '20px' }}
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="input-group">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              😊
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowGifPicker((prev) => !prev)
                if (!showGifPicker) fetchGifs('funny')
              }}
            >
              GIF
            </button>

            <input
              id="messageInput"
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoComplete="off"
            />

            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '10px',
              zIndex: 999,
            }}
          >
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* GIF Picker */}
        {showGifPicker && gifs.length > 0 && (
          <div
            className="d-flex gap-2 flex-wrap p-2 border bg-white shadow"
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '10px',
              width: '500px',
              height: '500px',
              overflowY: 'scroll',
              zIndex: 999,
            }}
          >
            {gifs.map((gif) => (
              <div
                key={gif.id}
                className="card"
                style={{
                  width: '150px',
                  height: '150px',
                  padding: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedGif(gif)
                  setShowGifPicker(false)
                }}
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt="GIF"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
