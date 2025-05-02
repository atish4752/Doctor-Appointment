import React from 'react'
import {assets} from '../assets/assets_frontend/assets.js'
const Contacts = () => {

  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>CONTACT <span className='text-gray-800 font-semibold'>US</span></p>
      </div>
      <div className="flex flex-col md:flex-row my-10 justify-center gap-10 text-sm mb-28">
        <img className='w-full md:max-w-[360px]' src={assets.contact_image}/>
      

      <div className="flex flex-col gap-6 justify-center items-start">
        <b className='font-semibold text-lg text-gray-600'>OUR OFFICE</b>
        <p className='text-gray-500'>Roorkee,Haridwar<br/>Uttrakhand</p>    
        <p className=' text-gray-600'>Tel:+91-9430569414<br/>Email:rohitisl2020@gmail.com</p>
        <p className='font-semibold text-lg text-gray-600' >Careers at PRESCRIPTO</p>
        <p className=' text-gray-600'>Learn more about our teams and job openings.</p>
        <button className='border px-8 text-sm py-4 border-black hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
      </div>
      </div>
    </div>
  )
}

export default Contacts