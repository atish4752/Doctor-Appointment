import validator from "validator";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/usermodel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

//api to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    //validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "enter a valid email",
      });
    }

    //validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "enter a strong password",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
    });
  } catch (e) {
    console.error(e.message);
    res.json({
      success: false,
      message: e.message,
    });
  }
};

//api for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({
        success: true,
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Invalid Credentials",
      });
    }
  } catch (e) {
    console.error(e.message);
    res.json({
      success: false,
      message: e.message,
    });
  }
};

//api to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");

    res.json({
      success: true,
      userData,
    });
  } catch (e) {
    console.error(e.message);
    res.json({
      success: false,
      message: e.message,
    });
  }
};

//api to update user profile
const updateProfile = async (req, res) => {
  try {
    // Fetch userId from request body or from authenticated user
    const { userId } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User  ID is required",
      });
    }

    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    // Validation for required fields
    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({
        success: false,
        message: "Required data is missing",
      });
    }

    // Prepare update data
    const updateData = {
      name,
      phone,
      dob,
      gender,
      address: JSON.parse(address), // Ensure address is valid JSON
    };

    // Handle image upload if present
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }
    }

    // Perform the update
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // Return the updated document
    );

    // Check if user was found and updated
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User  not found",
      });
    }

    // Respond with success
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (e) {
    console.error("Update error:", e);
    res.status(500).json({
      success: false,
      message: e.message || "Internal server error",
    });
  }
};

//api to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    // Check if userId, docId, slotDate, and slotTime are provided
    if (!userId || !docId || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required details",
      });
    }

    // Fetch doctor data
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if the doctor is available
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    // Ensure slots_booked is defined as an empty object if undefined
    let slots_book = docData.slots_book || {}; // Initialize slots_booked if it's undefined

    // Validate and format slotDate if necessary (e.g., '26_4_2025')
    if (!slots_book[slotDate]) {
      slots_book[slotDate] = [];
    }

    // Check if the slotTime is already booked for the slotDate
    if (slots_book[slotDate].includes(slotTime)) {
      return res.json({
        success: false,
        message: "Slot not available",
      });
    } else {
      slots_book[slotDate].push(slotTime); // Add the slotTime to the existing slotDate
    }

    // Fetch user data
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove sensitive data from docData before saving to appointment
    delete docData.slots_booked;

    // Create appointment data object
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(), // Save the current timestamp as a number (Unix timestamp)
    };

    // Create a new appointment
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slots_booked data in doctorModel
    await doctorModel.findByIdAndUpdate(docId, { slots_book });

    // Respond with success message
    res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (e) {
    console.error("Error during booking appointment:", e.message);
    res.status(500).json({
      success: false,
      message: e.message || "Internal server error",
    });
  }
};

//api to get user appointments for frontend page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({
      success: true,
      appointments,
    });
  } catch (e) {
    console.error(e.message);
  }
};

//api to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    //verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

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

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//api to make payment for appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
  

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    //creating option for razorpay payment
    const options = {
      amount: appointmentData.amount*100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //creation of order
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (e) {
    console.error(e.message);
    res.json({
      success: false,
      message: e.message,
    });
  }
};


//api to verify payment of razorpay
const verifyRazorpay=async(req,res)=>{
  try{
    
   const {razorpay_order_id}=req.body
   const orderInfo=await razorpayInstance.orders.fetch(razorpay_order_id)
   if(orderInfo.status==='paid'){
    await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
    res.json({success:true,message:'Payment Successfull'})
   }else{
    res.json({success:false,message:'Payment Failed'})
   }

  }catch(e){
    console.error(e.message)
    res.json({success:false,message:'e.message'})
  }
}

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay
};
