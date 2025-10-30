// components/PaymentSummary.jsx

export default function PaymentSummary({ subtotal, deliveryFee, tax, total }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Delivery Fee</span>
        <span className="font-medium">${deliveryFee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Tax</span>
        <span className="font-medium">${tax.toFixed(2)}</span>
      </div>
      <div className="border-t border-neutral-200 pt-3 flex justify-between">
        <span className="font-semibold text-lg">Total</span>
        <span className="font-semibold text-lg">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}