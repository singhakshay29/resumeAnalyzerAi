const pdfParse=require('pdf-parse');
const {generateInterviewReport} = require('../services/ai.service');
const interviewReportModal = require('../models/interview.modal');

async function generateInterviewReportController(req,res){
    const resumeFile=req.file;
    
    const resumeContent = pdfParse(resumeFile.buffer)
    const {selfDescription,jobDescription}=req.body;
    
    try {
        const interviewReportByAi =await generateInterviewReport({
            resume:resumeContent,
            selfDescription,
            jobDescription
        })
        
        const interviewReport = await interviewReportModal.create({
            userId:req.user.id,
            resume:resumeContent,
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
    }
   
    
}

module.exports={generateInterviewReportController}