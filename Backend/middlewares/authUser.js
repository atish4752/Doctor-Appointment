import jwt from 'jsonwebtoken'


//admin authentication middleware
const authUser=async(req,res,next)=>{
  try{
    const {token}=req.headers
    console.log("token is:",token)
    if(!token){
      return res.json({
        success:false,
        message:'Not Authorized Login Again 4'
      })
    }
    const token_decode=jwt.verify(token,process.env.JWT_SECRET)  
    if (!req.body) {
      req.body = req.body||{};// 👈 FIX is here
    }
    req.body.userId=token_decode.id
   
   
     next()

  }catch(e){
    console.error(e.message)
  }
}



export default authUser