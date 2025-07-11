import { Truck, Clock, CheckCircle } from 'lucide-react';

function TravelStatus({ travelStatus }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mt-4">
      <h3 className="text-blue-800 flex items-center gap-2 font-semibold mb-2">
        <Truck size={18} /> Travel Status
      </h3>
      <p><strong>Status:</strong> {travelStatus.travel_status}</p>
      <p className="mt-1">
        <Clock size={14} className="inline mr-1" />
        <strong>ETA:</strong> {travelStatus.eta} | <strong>Distance:</strong> {travelStatus.distance}
      </p>

      {travelStatus.travel_status === 'ARRIVED' && (
        <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
          <div className="flex items-center text-green-800">
            <CheckCircle size={16} className="mr-1" />
            <span className="text-sm font-medium">Barber has arrived at your location!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelStatus;
