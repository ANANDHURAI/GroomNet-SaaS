import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../slices/api/apiIntercepters";
import CustomerLayout from "../../components/customercompo/CustomerLayout";

function StatusCheaking() {
  const { bookingId } = useParams();
  const [travelStatus, setTravelStatus] = useState("NOT_STARTED");

  const fetchTravelStatus = async (bookingId) => {
    try {
      const response = await apiClient.get(
        `/customersite/booking/${bookingId}/get-travel-status/`
      );
      setTravelStatus(response.data.travel_status);
    } catch (error) {
      console.error("Error fetching travel status", error);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchTravelStatus(bookingId); 
      const interval = setInterval(() => fetchTravelStatus(bookingId), 3000);
      return () => clearInterval(interval);
    }
  }, [bookingId]); 

  return (
    <CustomerLayout>
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Current Travel Status: {travelStatus.replace("_", " ")}
        </h3>
        <div
          style={{
            height: "20px",
            width: "100%",
            backgroundColor: "#ddd",
            borderRadius: "5px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${getProgressPercentage(travelStatus)}%`,
              backgroundColor: "green",
              borderRadius: "5px",
            }}
          ></div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function getProgressPercentage(status) {
  switch (status) {
    case "STARTED":
      return 10;
    case "ON_THE_WAY":
      return 50;
    case "ALMOST_NEAR":
      return 80;
    case "ARRIVED":
      return 100;
    default:
      return 0;
  }
}

export default StatusCheaking;