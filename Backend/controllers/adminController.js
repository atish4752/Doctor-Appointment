import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'


//api for adding doctor
const addDoctor=async(req,res)=>{
     try{
          const {name,email,password,speciality,degree,fees,about,experience,address}=req.body;
          const imageFile=req.file
         
          //Checking for all data to add doctor
          if(!name||!email||!password||!speciality||!degree||!fees||!about||!experience||!address){
           return res.json({
            success:false,
            message:"Missing details"
           })
          }

          //Validating email format
          if(!validator.isEmail(email)){
            return res.json({
              message:"Please enter a valid email",
              success:false
            })
          }

          //validating Strong password
          if(password.length<8){
            return res.json({
              message:"Please enter a strong password",
              success:false
            })
          }

          //hashing doctor password
          const salt=await bcrypt.genSalt(10)
          const hashedPassword=await bcrypt.hash(password,salt)

          //upload image to cloudinary
          const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image",folder:"doctors"})
          const imageUrl=imageUpload.secure_url


          const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
          }

          const newDoctor=new doctorModel(doctorData)
          await newDoctor.save()

          res.json({
            success:true,
            message:"Doctor added Successfully"
          })



     }catch(e){
      console.error(e.message)
     }
}

//Api for the admin login
const loginAdmin=async(req,res)=>{
        try{
            const {email,password}=req.body
            if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            
              const token=jwt.sign(email+password,process.env.JWT_SECRET)
              res.json({
                success:true,
                token
              })
            }else{
              res.json({
                success:false,
                message:"Invalid Credentials"
              })
            }

        }catch(e){
          console.error(e.message)
        }

}

//api to get all doctor list
const allDoctors=async(req,res)=>{
  try{
    const doctors=await doctorModel.find({}).select('-password')
    res.json({
      success:true,
      doctors
    })

  }catch(e){
     console.error(e.message)
     res.json({
      success:false,
      message:e.message
     })
  }

}


//api to get all appointment list
const appointmentsAdmin=async(req,res)=>{
  try{
    const appointments=await appointmentModel.find({})
    res.json({success:true,appointments})

  }catch(e){
    console.error(e.message)
    res.json({
     success:false,
     message:e.message
    })
  }
}

//api for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const {appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);    

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_book = doctorData.slots_book;

    slots_book[slotDate] = slots_book[slotDate].filter((e) => e !== slotTime);

    await doctorModel.findByIdAndUpdate(docId, { slots_book });

    res.json({
      success: true,
      message: "Appointment Cancelled",
    });
  } catch (e) {
    console.error(e.message);
    res.json({
      success: false,
      message: e.message,
    });
  }
};

//api to get dashboard data for admin panel
const adminDashboard=async(req,res)=>{
  try{

    const doctors=await doctorModel.find({})
    const users=await userModel.find({})
    const appointments=await appointmentModel.find({})

    const dashData={
      doctors:doctors.length,
      appointments:appointments.length,
      patients:users.length,
      latestAppointments:appointments.reverse().slice(0,5)
    }

    res.json({
      success:true,dashData
    })

  }catch(e){
    console.error(e.message)
    res.json({
      success:false,message:e.message
    })
  }
}

export {addDoctor,loginAdmin,allDoctors,appointmentsAdmin,appointmentCancel,adminDashboard}