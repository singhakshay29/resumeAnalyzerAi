const multer=require('multer');


const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:5*1024*1024}, // 5MB limit  
})

const uploadResume = (req, res, next) => {
    console.log(">>> uploadResume called");
    console.log(">>> content-type:", req.headers["content-type"]);
    
    upload.single("resume")(req, res, (err) => {
      console.log(">>> multer done, err:", err);
      console.log(">>> req.file:", req.file?.originalname);
      console.log(">>> req.body:", req.body);
      
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
module.exports=uploadResume;