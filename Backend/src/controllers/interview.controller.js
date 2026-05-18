const pdfParse=require('pdf-parse');
const {generateInterviewReport} = require('../services/ai.service');
const interviewReportModal = require('../models/interview.modal');

async function generateInterviewReportController(req,res){
    
    const resumeContent = await pdfParse(req.file.buffer);
    const {selfDescription,jobDescription}=req.body;
    
    try {
        const interviewReportByAi =await generateInterviewReport({
            resume:resumeContent.text,
            selfDescription,
            jobDescription
        })
        
        const interviewReport = await interviewReportModal.create({
            user:req.user.id,
            resumeText: resumeContent.text,
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

module.exports={generateInterviewReportController,getInterviewReportById,getAllInterviewReportsByUser}