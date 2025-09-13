import React from 'react'

import { toast } from 'react-toastify'

import fa from '@/translations/languages/fa'

const getMessage = (key, fallback) => {
  return fa.messages?.[key] || fallback || key
}

// Component for expandable error messages
const ExpandableErrorToast = ({ message, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (!message || message.length <= maxLength) {
    return <span>{message}</span>
  }

  const truncatedMessage = message.substring(0, maxLength)
  const remainingText = message.substring(maxLength)

  const handleButtonClick = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleContainerClick = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div style={{ direction: 'rtl', textAlign: 'right' }} onClick={handleContainerClick}>
      <span>{isExpanded ? message : truncatedMessage}</span>
      {!isExpanded && <span style={{ color: '#666', fontSize: '0.9em' }}>...</span>}
      <br />
      <button
        onClick={handleButtonClick}
        style={{
          background: 'none',
          border: 'none',
          color: '#1976d2',
          cursor: 'pointer',
          fontSize: '0.85em',
          marginTop: '4px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {isExpanded ? (
          <>
            <span style={{ fontSize: '12px' }}>▲</span>
            <span>کمتر</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '12px' }}>▼</span>
            <span>بیشتر</span>
          </>
        )}
      </button>
    </div>
  )
}

export const toastSuccess = (msgKey = 'success', options = {}) => {
  toast.success(getMessage(msgKey, msgKey), {
    ...options,
    className: 'custom-toast custom-toast-success',
    bodyClassName: 'custom-toast-body',
    position: 'top-left',
    rtl: true,
    icon: '✓',
    autoClose: 4000,
    hideProgressBar: false
  })
}

export const toastError = (msgKey = 'error', options = {}) => {
  const message = getMessage(msgKey, msgKey)
  const isLongMessage = message && message.length > 100

  toast.error(<ExpandableErrorToast message={message} maxLength={100} />, {
    ...options,
    className: 'custom-toast custom-toast-error',
    bodyClassName: 'custom-toast-body',
    position: 'top-left',
    rtl: true,
    icon: '✕',
    autoClose: isLongMessage ? 10000 : 4000, // Give more time for long messages
    hideProgressBar: false,
    closeOnClick: !isLongMessage, // Disable click-to-close for long messages
    draggable: false // Disable dragging to prevent accidental dismissal
  })
}
