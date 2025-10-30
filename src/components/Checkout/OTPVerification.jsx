// components/OTPVerification.jsx
'use client'
import { useRef } from 'react'

export default function OTPVerification({ otp, onChange, onResend }) {
  const inputRefs = useRef([])

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      inputRefs.current[index - 1].focus()
    }
  }

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    onChange(index, value)

    if (value && index < 5) {
      // If digit entered and not last input, focus next input
      inputRefs.current[index + 1].focus()
    }
  }

  // Handle pasted content
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digits = pastedData.match(/\d/g)
    
    if (digits) {
      // Fill inputs with pasted digits
      digits.slice(0, 6).forEach((digit, i) => {
        onChange(i, digit)
        if (i < 5) inputRefs.current[i + 1].focus()
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex gap-3 justify-center mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="otp-input w-12 h-14 text-center text-xl font-semibold border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-neutral-500 mb-2">Didn't receive the email code?</p>
        <button onClick={onResend} className="text-sm text-neutral-900 font-medium hover:underline">
          Resend Email Code
        </button>
      </div>
    </div>
  )
}