// components/Checkout.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, X, ShoppingCart, MapPin, ShieldCheck, CheckCircle, Bike, ShoppingBag, Phone, Crosshair, Banknote, Mail, Info, Home, Map } from 'lucide-react'
import emailjs from '@emailjs/browser'
import CartSummary from './CartSummary'
import PaymentSummary from './PaymentSummary'
import DeliveryForm from './DeliveryForm'
import OTPVerification from './OTPVerification'

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
  const [orderData, setOrderData] = useState(null)
  const [verificationError, setVerificationError] = useState('')
  const router = useRouter()
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
      
  // Store full order and move to confirmation step (step 4)
  setOrderData(order)
  setStep(4)
      
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

      

        {step === 4 && orderData && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Order Placed Successfully!</h2>
              <p className="text-neutral-600">Your order has been confirmed and is being prepared</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="text-sm text-neutral-600">Order Number</span>
                <span className="font-semibold text-lg">{orderData._id}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="text-sm text-neutral-600">Estimated Delivery</span>
                <span className="font-semibold">25-35 minutes</span>
              </div>
              <div className="pb-4 border-b border-neutral-200">
                <div className="text-sm text-neutral-600">Delivery Address</div>
                <div className="font-medium text-sm mt-1">{orderData.address || orderData.addressLine || ''}</div>
              </div>

              <div>
                <div className="text-sm text-neutral-600 mb-2">Items</div>
                <ul className="divide-y divide-neutral-100 rounded-md overflow-hidden border border-neutral-100">
                  {(orderData.items || []).map((it, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="font-medium">{it.menuItem || it.name}</div>
                        <div className="text-xs text-neutral-500">Qty: {it.quantity} • Rs {Number(it.price || 0).toFixed(0)}</div>
                      </div>
                      <div className="font-medium">Rs {Number((it.price || 0) * (it.quantity || 1)).toFixed(0)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Paid</span>
                <span className="font-semibold text-xl">Rs {Number(orderData.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Track your order</p>
                <p className="text-sm text-blue-700">We'll send you updates via Email/SMS. You can also track your order in real-time.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { router.push(`/orders/${orderData._id}`) }}
                className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
              >
                <Map className="w-5 h-5" />
                Track Order
              </button>
              <button
                onClick={() => { router.push('/'); }}
                className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </div>
            </div>
          </div>
        )}
    </div>
  )
}