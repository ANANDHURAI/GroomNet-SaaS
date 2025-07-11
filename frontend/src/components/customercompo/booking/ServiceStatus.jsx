import { Scissors } from 'lucide-react';

function ServiceStatus() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mt-4">
      <h3 className="text-green-800 flex items-center gap-2 font-semibold mb-2">
        <Scissors size={18} /> Service Status
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-700 font-medium">Your barber is ready to start the service</p>
          <p className="text-sm text-green-600 mt-1">
            You will receive a notification when the barber wants to begin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600">Active</span>
        </div>
      </div>
    </div>
  );
}

export default ServiceStatus;
