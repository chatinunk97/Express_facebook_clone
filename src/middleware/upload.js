const multer = require("multer");
const storage = multer.diskStorage({
    destination :  (req,file,cb)=>{
        cb(null,'public')
    } ,
    filename : (req,file,cb)=>{
        const fileExtension = (file.originalname.split(".")[1])
        cb(null,'' + Date.now() + Math.round((Math.random() * 1000000))+"." +fileExtension)
    },
});

const upload = multer({storage : storage})
module.exports = upload
