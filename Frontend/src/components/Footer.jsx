import React from 'react'
import {assets} from '../assets/assets_frontend/assets.js'
import { useNavigate } from 'react-router-dom'
const Footer = () => {
  const navigate=useNavigate()
  return (
    <div className='md:mx-10'>
      {/*---Left Side */}
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div className="">
        <img className='mb-5 w-40' src={assets.logo} alt="error"/>
        <p className='w-full md:w-2/3 text-gray-600 leading-6'>This website is proudly created by <br/><span className='bg-primary text-white px-1.5 py-0.5 cursor-pointer '>Rohit Kumar</span> under the project name Prescripto.
It is designed to help users easily browse and book appointments with trusted doctors, providing a smooth and user-friendly healthcare experience.
</p>
      </div>
      {/*----center------*/}
      <div>
       <p className='text-xl font-medium mb-5'>COMPANY</p>
       <ul className='flex flex-col gap-2 text-gray-600'>
        <li onClick={()=>{navigate(`/`); scrollTo(0,0)}} className='cursor-pointer'>Home</li>
        <li onClick={()=>navigate(`/about`)} className='cursor-pointer'>About us</li>
        <li onClick={()=>navigate(`/contact`)} className='cursor-pointer'>Contact us</li>
        <li className='cursor-pointer'>Privacy Policy</li>
       </ul>
      </div>
      {/*-----Right Side-----*/}
      <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul  className='flex flex-col gap-2 text-gray-600'>
            <li onClick={() => window.open("tel:+919430569414")} className='cursor-pointer'>+91-9430569414</li>
            <li onClick={() =>window.open("https://mail.google.com/mail/?view=cm&fs=1&to=rohitisl2016@gmail.com","_blank")} className='cursor-pointer'>rohitisl2016@gmail.com</li>
          </ul>
      </div>
      </div>
      {/*----Comment Text------*/}
      <div className="">
        <hr/>
        <p className='py-5 text-center text-sm'>@Copyright 2025 Prescripto. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer