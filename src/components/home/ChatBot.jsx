import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Typewriter } from 'react-simple-typewriter'
import { getAIResponse } from './aiService'

const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-full"
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    ghost: "text-blue-600 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-6 py-3",
  }

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`flex h-12 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      ref={ref}
      {...props}
    />
  )
})

const ThinkingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-start"
  >
    <div className="bg-blue-100 p-3 rounded-2xl max-w-[70%]">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="flex items-center font-medium text-blue-600"
      >
        <svg className="w-5 h-5 mr-3 -ml-1 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Thinking...
      </motion.div>
    </div>
  </motion.div>
)

export default function ChatBot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true)

  const predefinedQuestions = [
    "How to get started",
    "Book Tickets",
    "Museum Status",
    "Contact Staff",
    "History of the Museum",
    "Amenities Available",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && showWelcomeMessage) {
      const timer = setTimeout(() => {
        setMessages([
          {
            text: "Welcome to HeritageLink! I'm your AI assistant, here to help you explore our museum and book tickets. How may I assist you today?",
            sender: 'ai'
          }
        ])
        setShowWelcomeMessage(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, showWelcomeMessage])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { text: input, sender: 'user' }])
    setInput('')

    try {
      const aiResponse = await getAIResponse(input)
      setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, { text: "I apologize, but I'm unable to process that request at the moment. How else can I assist you with HeritageLink's services or provide information about our exhibits and Indian cultural heritage?", sender: 'ai' }])
    }

    setIsLoading(false)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowWelcomeMessage(true)
  }

  return (
    <div className="fixed z-50 bottom-4 right-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isExpanded ? 'min(95vw, 600px)' : 'min(90vw, 400px)',
              height: isExpanded ? 'min(90vh, 750px)' : 'min(80vh, 650px)'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-col overflow-hidden bg-white shadow-2xl rounded-3xl"
            style={{
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)',
            }}
          >
            <motion.div
              className="flex items-center justify-between p-4 text-white cursor-move md:p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl"
              whileHover={{ backgroundImage: 'linear-gradient(to right, #3B82F6, #4F46E5)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-blue-600 bg-white rounded-full shadow-inner md:w-12 md:h-12">
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-semibold md:text-md">Heritage Link Assistant</h3>
                  <p className="text-xs text-blue-200 md:text-sm">Your cultural guide</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-white hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-white hover:text-black">
                  {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </motion.div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto md:p-6 bg-gradient-to-b from-blue-50 to-white">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 md:p-4 rounded-2xl shadow-md ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-100'
                      }`}
                    >
                      {message.sender === 'ai' ? (
                        <Typewriter
                          words={[message.text]}
                          typeSpeed={30}
                          cursor={false}
                        />
                      ) : (
                        message.text
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 md:p-6 bg-gradient-to-b from-white to-blue-50 rounded-b-3xl">
              <div className="flex mb-4 space-x-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI Anything..."
                  className="flex-grow shadow-inner bg-blue-50"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="transition-shadow rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs transition-colors border border-blue-200 rounded-full hover:bg-blue-100"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-4 text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}