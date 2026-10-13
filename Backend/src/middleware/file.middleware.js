const multer=require('multer');
const { log } = require("../utils/logger");
const path = require("path");


const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:5*1024*1024},
    fileFilter: (req, file, callback) => {
      if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
        return callback(new Error("Only PDF resumes are supported"));
      }
      return callback(null, true);
    },
})

const uploadResume = (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        log("warn", "resume_upload_rejected", { requestId: req.id, reason: err.code });
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        log("warn", "resume_upload_rejected", { requestId: req.id, reason: err.message });
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
module.exports=uploadResume;
