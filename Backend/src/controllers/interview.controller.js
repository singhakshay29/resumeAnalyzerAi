const pdfParse=require('pdf-parse');
const {generateInterviewReport} = require('../services/ai.service');
const interviewReportModal = require('../models/interview.modal');

async function generateInterviewReportController(req,res){
    
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
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

module.exports={generateInterviewReportController}