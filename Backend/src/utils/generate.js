const PDFDocument = require("pdfkit");

const generateInterviewPdf = (report, res) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=interview-report.pdf`
  );

  doc.pipe(res);

  // Title
  doc
    .fontSize(24)
    .text(report.title, {
      align: "center",
    });

  doc.moveDown();

  // Match Score
  doc
    .fontSize(18)
    .text(`Match Score: ${report.matchScore}%`);

  doc.moveDown();

  // Technical Questions
  doc
    .fontSize(18)
    .text("Technical Questions");

  report.technicalQuestions?.forEach((q, index) => {
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(`${index + 1}. ${q.question}`);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Purpose: ${q.intention}`);

    doc.fillColor("black");
  });

  doc.addPage();

  // Behaviour Questions
  doc
    .fontSize(18)
    .text("Behaviour Questions");

  report.behaviourQuestions?.forEach((q, index) => {
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(`${index + 1}. ${q.question}`);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Purpose: ${q.intention}`);

    doc.fillColor("black");
  });

  // Skill Gaps
  doc.moveDown();

  doc
    .fontSize(18)
    .text("Skill Gaps");

  report.skillGaps
    ?.filter(Boolean)
    ?.forEach((gap) => {
      doc.text(`• ${gap.skill}`);
    });

  // Preparation Plan
  doc.addPage();

  doc
    .fontSize(18)
    .text("7-Day Preparation Plan");

  report.preparationPlan?.forEach((day) => {
    doc.moveDown();

    doc
      .fontSize(14)
      .text(`Day ${day.day}: ${day.focus}`);

    day.task?.forEach((task) => {
      doc
        .fontSize(11)
        .text(`• ${task}`);
    });
  });

  doc.end();
};

module.exports = generateInterviewPdf;