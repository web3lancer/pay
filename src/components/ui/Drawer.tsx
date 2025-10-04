'use client'

import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FiX } from 'react-icons/fi'
import { cn } from '@/lib/utils'

type DrawerPosition = 'bottom' | 'right' | 'left' | 'top'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  position?: DrawerPosition
  size?: string
  showCloseButton?: boolean
  closeOnOutsideClick?: boolean
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'bottom',
  size = '85%', // This can be a percentage or pixel value
  showCloseButton = true,
  closeOnOutsideClick = true,
  className
}: DrawerProps) {
  // Position mapping for animations and styles
  const positionStyles = {
    bottom: {
      container: 'items-end justify-center',
      panel: 'w-full rounded-t-xl',
      size: { height: size, maxHeight: '85vh' },
      transition: {
        enter: 'transform transition ease-out duration-500',
        enterFrom: 'translate-y-full',
        enterTo: 'translate-y-0',
        leave: 'transform transition ease-in duration-300',
        leaveFrom: 'translate-y-0',
        leaveTo: 'translate-y-full'
      }
    },
    right: {
      container: 'items-center justify-end',
      panel: 'h-full rounded-l-xl',
      size: { width: size, maxWidth: '85vw' },
      transition: {
        enter: 'transform transition ease-out duration-500',
        enterFrom: 'translate-x-full',
        enterTo: 'translate-x-0',
        leave: 'transform transition ease-in duration-300',
        leaveFrom: 'translate-x-0',
        leaveTo: 'translate-x-full'
      }
    },
    left: {
      container: 'items-center justify-start',
      panel: 'h-full rounded-r-xl',
      size: { width: size, maxWidth: '85vw' },
      transition: {
        enter: 'transform transition ease-out duration-500',
        enterFrom: '-translate-x-full',
        enterTo: 'translate-x-0',
        leave: 'transform transition ease-in duration-300',
        leaveFrom: 'translate-x-0',
        leaveTo: '-translate-x-full'
      }
    },
    top: {
      container: 'items-start justify-center',
      panel: 'w-full rounded-b-xl',
      size: { height: size, maxHeight: '85vh' },
      transition: {
        enter: 'transform transition ease-out duration-500',
        enterFrom: '-translate-y-full',
        enterTo: 'translate-y-0',
        leave: 'transform transition ease-in duration-300',
        leaveFrom: 'translate-y-0',
        leaveTo: '-translate-y-full'
      }
    }
  }

  const selectedPosition = positionStyles[position]

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={closeOnOutsideClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        
        {/* Drawer container */}
        <div className={cn('fixed inset-0 flex', selectedPosition.container)}>
          {/* Drawer panel */}
          <Transition.Child
            as={Fragment}
            enter={selectedPosition.transition.enter}
            enterFrom={selectedPosition.transition.enterFrom}
            enterTo={selectedPosition.transition.enterTo}
            leave={selectedPosition.transition.leave}
            leaveFrom={selectedPosition.transition.leaveFrom}
            leaveTo={selectedPosition.transition.leaveTo}
          >
            <Dialog.Panel
              className={cn(
                'bg-white shadow-xl overflow-hidden transform transition-all',
                selectedPosition.panel,
                className
              )}
              style={selectedPosition.size}
            >
              {/* Header with handle */}
              {position === 'bottom' && (
                <div className="flex items-center justify-center pt-2">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
              )}
              
              {/* Title section */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  {title && (
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-gray-500">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                  )}
                  {showCloseButton && (
                    <motion.button
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      onClick={onClose}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiX className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}