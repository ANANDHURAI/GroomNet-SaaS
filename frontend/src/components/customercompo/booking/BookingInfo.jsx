function BookingInfo({ data, timeLeft }) {
  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Order ID:</strong> #{data.orderid}</p>
          <p><strong>Service:</strong> {data.service}</p>
          <p><strong>Status:</strong> {data.booking_status}</p>
        </div>
        <div>
          <p><strong>Customer:</strong> {data.name}</p>
          <p><strong>Barber:</strong> {data.barbername}</p>
        </div>
        <div>
          <p><strong>Date:</strong> {data.date}</p>
          <p><strong>Time:</strong> {data.slottime}</p>

        </div>
        <div>
          <p><strong>Payment:</strong> {data.payment_method}</p>
          <p><strong>Amount:</strong> ₹{data.total_amount}</p>
          <p><strong>Booking Type:</strong> {data.booking_type}</p>
        </div>
      </div>
    </div>
  );
}

export default BookingInfo;
