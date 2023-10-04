exports.updateProfile = async(req,res,next)=>{
    try {
        res.json({message : "user controller reached"})
    } catch (error) {
        next(error)
    }
}