const asyncHandler = (fn)=>{
    async (req,res,next)=>{
        try{
            await fn(req,res,next)
        }
        catch(error){
            // console.log(error);
            // throw error;
            res.status(error.code=500 || 500).json({
                success:false,
                message:error.message,
            })
        }
    }
}


module.exports = asyncHandler;