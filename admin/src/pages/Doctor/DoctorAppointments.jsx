import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

function DoctorAppointments() {
  const { dToken, appointments, getAppointments,completeAppointment,cancelAppointment} = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll min-h-[50vh]">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b font-semibold bg-gray-50">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {
          appointments && appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div key={index} className="grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b items-center">
                <p>{index + 1}</p>
                <div className="flex items-center gap-2">
                  <img src={item.userData.image} alt="error" className="w-8 h-8 rounded-full object-cover" />
                  <p>{item.userData.name}</p>
                </div>
                <p className='text-gray-600 font-medium '>{item.payment ? 'Online' : 'CASH'}</p>
                <p>{calculateAge(item.userData.dob)}</p>
                <p>{slotDateFormat(item.slotDate)} {item.slotTime}</p>
                <p>{currency}{item.amount}</p>
                {
                  item.cancelled?
                  <p className='text-red-400 text-xs font-medium'>Cancelled</p>:
                  item.isCompleted?
                  <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                  <img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                  <img onClick={()=>completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                </div>
                }
               
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">No appointments found</div>
          )
        }
      </div>
    </div>
  );
}

export default DoctorAppointments;
