import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets.js";
import RelatedDoctors from "../components/RelatedDoctors.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0); // 9 PM

      // Set start time - if today, start from current hour + 1 or 10 AM
      if (i === 0) {
        const now = new Date();
        currentDate.setHours(Math.max(now.getHours() + 1, 10));
        currentDate.setMinutes(now.getMinutes() > 30 ? 30 : 0);
        currentDate.setSeconds(0, 0);
      } else {
        currentDate.setHours(10, 0, 0, 0); // 10 AM
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime=formattedTime

        const isSlotAvailable=docInfo.slots_book[slotDate] && docInfo.slots_book[slotDate].includes(slotTime)?false:true

        if(isSlotAvailable){
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }
       
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      console.log(date);

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
      toast.error(e.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  if (!docInfo) {
    return (
      <div className="bg-blue-400 text-center text-white p-4">
        Loading doctor information...
      </div>
    );
  }

  return (
    <div>
      {/*----Doctor Details-----*/}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="w-full bg-primary sm:max-w-72 rounded-lg"
            src={docInfo.image}
            alt="Doctor"
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="verified" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 border text-xs rounded-full px-2">
              {docInfo.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About
              <img src={assets.info_icon} alt="info" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-600">
              {currencySymbol}
              {docInfo.fees}
            </span>
          </p>
        </div>
      </div>

      {/*-------Booking slots----*/}
      <div className="sm:ml-72 sm:pl-4 mt-4 text-gray-700">
        <p className="font-semibold">Booking Slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 pb-2">
          {docSlots.length > 0 ? (
            docSlots.map((item, index) => {
              if (item.length === 0) return null;
              const date = new Date(item[0].datetime);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  onClick={() => {
                    setSlotIndex(index);
                    scrollTo(0, 400);
                  }}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200 hover:bg-gray-100"
                  }`}
                  key={index}
                >
                  <p>{daysOfWeek[date.getDay()]}</p>
                  <p>
                    {date.getDate()} {isToday && "(Today)"}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">Loading slots...</p>
          )}
        </div>

        {/* Time slots for selected day */}
        {docSlots.length > 0 && docSlots[slotIndex]?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Available times for{" "}
              {daysOfWeek[new Date(docSlots[slotIndex][0].datetime).getDay()]},{" "}
              {new Date(docSlots[slotIndex][0].datetime).toLocaleDateString()}:
            </p>
            <div className="flex flex-wrap gap-3">
              {docSlots[slotIndex].map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSlotTime(slot.time)}
                  className={`py-2 px-4 rounded-md ${
                    slotTime === slot.time
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {slotTime && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Selected slot:</p>
            <p className="font-medium">
              {daysOfWeek[new Date(docSlots[slotIndex][0].datetime).getDay()]},{" "}
              {new Date(docSlots[slotIndex][0].datetime).toLocaleDateString()}{" "}
              at {slotTime}
            </p>
            <button
              onClick={bookAppointment}
              className="mt-4 bg-primary text-white py-2 px-6 rounded-md hover:bg-blue-700"
            >
              Confirm Appointment
            </button>
          </div>
        )}
      </div>

      {/*------Listing Related doctors------*/}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
