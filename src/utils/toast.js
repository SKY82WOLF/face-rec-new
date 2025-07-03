import { toast } from 'react-toastify'

import fa from '@/translations/languages/fa'

const getMessage = (key, fallback) => {
  return fa.messages?.[key] || fallback || key
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
  toast.error(getMessage(msgKey, msgKey), {
    ...options,
    className: 'custom-toast custom-toast-error',
    bodyClassName: 'custom-toast-body',
    position: 'top-left',
    rtl: true,
    icon: '✕',
    autoClose: 4000,
    hideProgressBar: false
  })
}
