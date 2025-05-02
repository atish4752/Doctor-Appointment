import jwt from 'jsonwebtoken'


//doctor authentication middleware
const authDoctor=async(req,res,next)=>{
  try{
    const {dtoken}=req.headers
    console.log("token is:",dtoken)
    if(!dtoken){
      return res.json({
        success:false,
        message:'Not Authorized Login Again 4'
      })
    }
    const token_decode=jwt.verify(dtoken,process.env.JWT_SECRET)  
    if (!req.body) {
      req.body = req.body||{};// 👈 FIX is here
    }
    req.body.docId=token_decode.id
   
   
     next()

  }catch(e){
    console.error(e.message)
  }
}



export default authDoctor