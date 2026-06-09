const pdfParse=require('pdf-parse');
const {generateInterviewReport} = require('../services/ai.service');
const interviewReportModal = require('../models/interview.modal');
const generateInterviewPdf = require('../utils/generate');

async function generateInterviewReportController(req,res){ 
    try {
        const {selfDescription,jobDescription}=req.body;
        console.log("Received data:", { selfDescription, jobDescription, hasResume: !!req.file });
        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
              success: false,
              message: "selfDescription and jobDescription are required",
            });
          }
          let resumeText = "";
          if (req.file) {
            const resumeContent = await pdfParse(req.file.buffer);
            resumeText = resumeContent.text;
          }    
        
        
        const interviewReportByAi =await generateInterviewReport({
            resume:resumeText,
            selfDescription,
            jobDescription
        })
        
        const interviewReport = await interviewReportModal.create({
            user:req.user.id,
            resumeText:  resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })
        res.status(200).json({
            success:true,
            data:interviewReport
        })
    } catch (error) {
        console.error("Error generating interview report:", error);
        res.status(500).json({
            success:false,
            message:"Failed to generate interview report"
        })
    }
   
    
}

async function getInterviewReportById(req,res){
    const {id}=req.params;
    try {
        const interviewReport = await interviewReportModal.findOne({_id:id,user:req.user.id});
        if(!interviewReport){
            return res.status(404).json({
                success:false,
                message:"Interview report not found"
            })
        }
        res.status(200).json({
            success:true,
            data:interviewReport
        })
    } catch (error) {
        console.error("Error fetching interview report:", error);
        res.status(500).json({
            success:false,
            message:"Failed to fetch interview report"
        })
    }
}

async function getAllInterviewReportsByUser(req,res){
    try {
        const interviewReports = await interviewReportModal.find({user:req.user.id}).sort({createdAt:-1}).select('-resumeText -selfDescription -jobDescription -__v -technicalQuestions.answer -behaviourQuestions.answer -skillGaps.severity -skillGaps.skill -preparationPlanSchema.task');
        res.status(200).json({
            success:true,
            data:interviewReports
        })
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        res.status(500).json({
            success:false,
            message:"Failed to fetch interview reports"
        })
    }
}

async function downloadReport (req, res){
    try {
      const { id } = req.params;
  
      const report = await interviewReportModal.findById(id);
  
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }
  
      generateInterviewPdf(report, res);
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }
  };

module.exports={generateInterviewReportController,getInterviewReportById,getAllInterviewReportsByUser,downloadReport}