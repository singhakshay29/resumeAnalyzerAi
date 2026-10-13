const ReportComparison = ({ reports, onClose }) => {
  if (reports.length < 2) return null;

  return (
    <section className="report-comparison" aria-labelledby="comparison-title">
      <div className="comparison-heading">
        <div>
          <span className="tag">Progress over time</span>
          <h2 id="comparison-title">Compare reports</h2>
        </div>
        <button type="button" className="comparison-close" onClick={onClose}>Clear comparison</button>
      </div>
      <div className="comparison-grid">
        {reports.map((report) => {
          const taskCount = (report.preparationPlan || []).reduce(
            (count, day) => count + (day.task?.length || 0),
            0,
          );
          const availableTaskKeys = new Set((report.preparationPlan || []).flatMap(
            (day) => (day.task || []).map((_, index) => `${day.day}:${index}`),
          ));
          const completedCount = (report.completedTaskKeys || []).filter((key) => availableTaskKeys.has(key)).length;
          return (
            <article className="comparison-report" key={report._id}>
              <h3>{report.title}</h3>
              <p>{new Date(report.createdAt).toLocaleDateString()}</p>
              <dl>
                <div><dt>Match score</dt><dd>{report.matchScore}%</dd></div>
                <div><dt>Preparation</dt><dd>{completedCount}/{taskCount} tasks</dd></div>
              </dl>
              <h4>Skill gaps</h4>
              <ul>
                {(report.skillGaps || []).map((gap, index) => <li key={`${gap.skill}-${index}`}>{gap.skill}</li>)}
                {!report.skillGaps?.length && <li>No skill gaps listed</li>}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ReportComparison;
