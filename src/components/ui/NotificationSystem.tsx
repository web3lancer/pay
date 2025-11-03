'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiCheck, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NotificationSystem({ 
  notifications, 
  onRemove,
  position = 'top-right'
}: NotificationSystemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheck className="h-5 w-5 text-green-500" />
      case 'error':
        return <FiAlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <FiInfo className="h-5 w-5 text-blue-500" />
      default:
        return <FiInfo className="h-5 w-5 text-neutral-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 shadow-lg shadow-green-200/40'
      case 'error':
        return 'bg-red-50 border-red-200 shadow-lg shadow-red-200/40'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 shadow-lg shadow-yellow-200/40'
      case 'info':
        return 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-200/40'
      default:
        return 'bg-neutral-50 border-neutral-200 shadow-lg shadow-neutral-200/40'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full space-y-3`}>
      <>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            getIcon={getIcon}
            getBackgroundColor={getBackgroundColor}
          />
        ))}
      </>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
  getIcon: (type: string) => React.ReactNode
  getBackgroundColor: (type: string) => string
}

function NotificationItem({ 
  notification, 
  onRemove, 
  getIcon, 
  getBackgroundColor 
}: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(notification.id), 300)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onRemove])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  return (
    <div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : 100, 
        scale: isVisible ? 1 : 0.8 
      }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative rounded-lg border shadow-lg p-4 ${getBackgroundColor(notification.type)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-neutral-900 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-neutral-700">
            {notification.message}
          </p>
          
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-4 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-primary-500 rounded-bl-lg"
        />
      )}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const removeAllNotifications = () => {
    setNotifications([])
  }

  // Convenience methods
  const notifySuccess = (title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options })
  }

  const notifyError = (title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'error', title, message, duration: 8000, ...options })
  }

  const notifyWarning = (title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options })
  }

  const notifyInfo = (title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  }
}