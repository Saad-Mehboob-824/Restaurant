import { Check, X, Phone, Clock, MapPin, ShoppingBag } from 'lucide-react'

export const STATUS_STYLES = {
  pending: {
    dot: 'bg-neutral-400 ring-neutral-300',
    text: 'text-neutral-700',
    buttons: [
      {
        label: 'Call',
        icon: Phone,
        class: 'text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50',
        action: 'call'
      },
      {
        label: 'Accept',
        icon: Check,
        class: 'text-white bg-emerald-600 hover:bg-emerald-700',
        action: 'accept'
      },
      {
        label: 'Decline',
        icon: X,
        class: 'text-white bg-red-600 hover:bg-red-700',
        action: 'decline'
      }
    ]
  },
  accepted: {
    dot: 'bg-blue-500 ring-blue-300',
    text: 'text-blue-700',
    button: {
      label: 'Start Preparing',
      icon: ShoppingBag,
      class: 'text-white bg-amber-600 hover:bg-amber-700',
      action: 'prepare'
    }
  },
  preparing: {
    dot: 'bg-amber-500 ring-amber-300',
    text: 'text-amber-700',
    button: {
      label: 'Mark Prepared',
      icon: Check,
      class: 'text-white bg-indigo-600 hover:bg-indigo-700',
      action: 'prepared'
    }
  },
  prepared: {
    dot: 'bg-indigo-500 ring-indigo-300',
    text: 'text-indigo-700',
    button: {
      label: 'Start Delivery',
      icon: MapPin,
      class: 'text-white bg-sky-600 hover:bg-sky-700',
      action: 'deliver'
    }
  },
  delivering: {
    dot: 'bg-sky-500 ring-sky-300',
    text: 'text-sky-700',
    button: {
      label: 'Mark Delivered',
      icon: Check,
      class: 'text-white bg-emerald-600 hover:bg-emerald-700',
      action: 'delivered'
    }
  },
  delivered: {
    dot: 'bg-emerald-500 ring-emerald-300',
    text: 'text-emerald-700',
    completedBadge: {
      label: 'Completed',
      icon: Check
    }
  }
}