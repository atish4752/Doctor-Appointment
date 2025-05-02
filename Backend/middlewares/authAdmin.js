import jwt from 'jsonwebtoken'

//admin authentication middleware
const authAdmin=async(req,res,next)=>{
  try{
    const {atoken}=req.headers
    console.log("token is:",atoken)
    if(!atoken){
      return res.json({
        success:false,
        message:'Not Authorized Login Again 4'
      })
    }
    const token_decode=jwt.verify(atoken,process.env.JWT_SECRET)


    if(token_decode!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
      return res.json({
        success:false,
        message:'Not Authorized Login Again'
      })
    }
     next()

  }catch(e){
    console.error(e.message)
  }
}

export default authAdmin