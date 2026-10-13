const PreparationPlan = ({ plan = [], completedTaskKeys = [], onToggleTask }) => {
  const completed = new Set(completedTaskKeys);
  const totalTasks = plan.reduce((count, day) => count + (day.task?.length || 0), 0);
  const validTaskKeys = new Set(plan.flatMap((day) => (day.task || []).map((_, index) => `${day.day}:${index}`)));
  const completedCount = [...completed].filter((key) => validTaskKeys.has(key)).length;

  return (
    <section className="preparation-plan" aria-labelledby="preparation-plan-title">
      <div className="preparation-plan-heading">
        <div>
          <span className="tag">Your next steps</span>
          <h2 id="preparation-plan-title">Preparation plan</h2>
        </div>
        <span className="plan-progress" aria-live="polite">
          {completedCount} of {totalTasks} tasks complete
        </span>
      </div>
      <div className="preparation-days">
        {plan.map((day) => (
          <section className="preparation-day" key={day.day}>
            <h3>Day {day.day}: {day.focus}</h3>
            <ul>
              {(day.task || []).map((task, taskIndex) => {
                const taskKey = `${day.day}:${taskIndex}`;
                const isComplete = completed.has(taskKey);
                return (
                  <li key={taskKey}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isComplete}
                        onChange={(event) => onToggleTask({
                          day: day.day,
                          taskIndex,
                          completed: event.target.checked,
                        })}
                      />
                      <span>{task}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
};

export default PreparationPlan;
