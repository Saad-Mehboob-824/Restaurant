// components/Checkout.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, X, ShoppingCart, MapPin, ShieldCheck, CheckCircle, Bike, ShoppingBag, Phone, Crosshair, Banknote, Mail, Info, Home, Map } from 'lucide-react'
import emailjs from '@emailjs/browser'
import CartSummary from './CartSummary'
import PaymentSummary from './PaymentSummary'
import DeliveryForm from './DeliveryForm'
import OTPVerification from './OTPVerification'
import OrderSuccessModal from './OrderSuccessModal'

export default function Checkout({ cart: initialCart, user = {}, onOrderPlaced }) {
  const [step, setStep] = useState(1)
  const [localCart, setLocalCart] = useState(initialCart)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash')
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    address: user.address || '',
    apartment: '',
    instructions: '',
    orderType: 'delivery',
    pickupLocation: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [verificationError, setVerificationError] = useState('')
  const initialFormData = {
    name: '',
    phone: '',
    email: '',
    address: '',
    apartment: '',
    instructions: '',
    orderType: 'delivery',
    pickupLocation: '',
  }

  const clearCart = () => {
    setLocalCart([])
  }

  const subtotal = localCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 5.00
  const tax = subtotal * 0.09 // Assuming 9% tax as example
  const total = subtotal + deliveryFee + tax

  const updateQuantity = (index, delta) => {
    const newCart = [...localCart]
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta)
    setLocalCart(newCart)
  }

  const handleFormChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
  }

  const generateAndSendOTP = async () => {
    try {
      // Generate a random 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(newOtp)
      
      // Initialize EmailJS with your public key
      emailjs.init("y3LTt-etrHp9cxK4b") // Replace with your EmailJS public key
      
      // Prepare the email template parameters
      const templateParams = {
        email: formData.email,
        to_name: formData.name,
        otp: newOtp,
      }
      
      // Send the email using EmailJS
      await emailjs.send(
        'service_pamxyy4',
        'template_hym3a33',
        templateParams
      )
      
      // Show success message
      alert('Verification code sent to your email!')
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send verification code. Please try again.')
    }
  }

  const goToStep = (newStep) => {
    if (newStep > step) {
      if (step === 2) {
        if (!formData.name) return alert('Please enter your name')
        if (!formData.phone) return alert('Please enter your phone number')
        if (!formData.email) return alert('Please enter your email')
        if (formData.orderType === 'delivery') {
          if (!formData.address) return alert('Please enter your delivery address')
        } else {
          if (!formData.pickupLocation) return alert('Please select a pickup location')
        }
      }
      
      // Generate and send OTP when moving to verification step
      if (newStep === 3) {
        generateAndSendOTP()
      }
    }
    setVerificationError('')
    setStep(newStep)
  }

  const handlePlaceOrder = async () => {
    const enteredOtp = otp.join('')
    if (enteredOtp.length !== 6) {
      setVerificationError('Please enter the complete 6-digit code')
      return
    }

    // Verify OTP
    if (enteredOtp !== generatedOtp) {
      setVerificationError('Invalid verification code. Please try again.')
      return
    }

    setVerificationError('') // Clear any previous errors

    const address = formData.orderType === 'delivery'
      ? `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ''}`
      : formData.pickupLocation
      
    try {
      // Create the order object
      const payload = {
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        orderType: formData.orderType,
        address: address,
        instructions: formData.instructions,
        items: localCart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: selectedPaymentMethod,
        status: 'pending'
      }

      // Send order to the backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      
      // Show success modal
      setOrderData({
        id: order._id,
        address: address,
        total: total
      })
      setShowSuccessModal(true)
      
      // Clear cart and form data
      clearCart()
      setFormData(initialFormData)
      
      // Call onOrderPlaced callback if provided
      if (onOrderPlaced) {
        onOrderPlaced(order)
      }

    } catch (error) {
      console.error('Error creating order:', error)
      setVerificationError('Failed to place order. Please try again.')
    }
  }

  const getIndicatorClasses = (indicatorStep) => {
    if (indicatorStep < step) return 'w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold mb-2 step-indicator'
    if (indicatorStep === step) return 'w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold mb-2 step-indicator'
    return 'w-10 h-10 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center text-sm font-semibold mb-2 step-indicator'
  }

  const getTextClasses = (indicatorStep) => {
    if (indicatorStep < step) return 'text-xs font-medium text-green-600'
    if (indicatorStep === step) return 'text-xs font-medium text-neutral-900'
    return 'text-xs font-medium text-neutral-500'
  }

  const getProgressClasses = (progressIndex) => {
    if (progressIndex < step - 1) return 'flex-1 h-0.5 bg-green-600 -mt-6'
    return 'flex-1 h-0.5 bg-neutral-200 -mt-6'
  }

  return (
    <div className="min-h-screen pb-20 bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-900 text-white w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold tracking-tight">
                FD
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>
            </div>
            <button onClick={() => window.history.back()} className="p-2 hover:bg-neutral-100 rounded-lg transition-all">
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className={getIndicatorClasses(1)}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className={getTextClasses(1)}>Order</span>
            </div>
            <div className={getProgressClasses(1)} />
            <div className="flex flex-col items-center flex-1">
              <div className={getIndicatorClasses(2)}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className={getTextClasses(2)}>Details</span>
            </div>
            <div className={getProgressClasses(2)} />
            <div className="flex flex-col items-center flex-1">
              <div className={getIndicatorClasses(3)}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className={getTextClasses(3)}>Verify</span>
            </div>
            <div className={getProgressClasses(3)} />
            <div className="flex flex-col items-center flex-1">
              <div className={getIndicatorClasses(4)}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className={getTextClasses(4)}>Done</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Confirm Your Order</h2>
              <p className="text-neutral-600">Review your items before proceeding</p>
            </div>
            <CartSummary cart={localCart} onUpdateQuantity={updateQuantity} />
            <PaymentSummary subtotal={subtotal} deliveryFee={deliveryFee} tax={tax} total={total} />
            <button
              onClick={() => goToStep(2)}
              className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
            >
              Continue to Details
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Delivery Details</h2>
              <p className="text-neutral-600">Enter your contact and delivery address</p>
            </div>
            <DeliveryForm formData={formData} onChange={handleFormChange} />
            <div className="flex gap-3">
              <button
                onClick={() => goToStep(1)}
                className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => goToStep(3)}
                className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Verify via Email</h2>
              <p className="text-neutral-600">
                Enter the 6-digit code sent to your Email at <span className="font-medium text-neutral-900">{formData.email}</span>
              </p>
            </div>
            <OTPVerification 
              otp={otp} 
              onChange={handleOtpChange} 
              onResend={() => {
                generateAndSendOTP()
                setOtp(['', '', '', '', '', ''])
                setVerificationError('')
              }} 
            />
            {verificationError && (
              <div className="text-red-600 text-sm text-center font-medium">
                {verificationError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => goToStep(2)}
                className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                // VERIFY & PLACE ORDER BUTTON
                // Clicking this button calls `handlePlaceOrder` which performs
                // client-side OTP length check and then sends the order to
                // `/api/orders` (see the fetch call in `handlePlaceOrder`).
                className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                Verify & Place Order
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {showSuccessModal && orderData && (
        <OrderSuccessModal
          orderId={orderData.id}
          address={orderData.address}
          total={orderData.total}
          onTrack={() => alert('Redirecting to order tracking...')}
          onClose={() => alert('Redirecting to home page...')}
        />
      )}
    </div>
  )
}