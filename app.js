// Global React and Recharts are loaded via script tags
const React = window.React;
const ReactDOM = window.ReactDOM;
const { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  RadialBarChart, 
  RadialBar 
} = window.Recharts;

function RoutineTracker() {
  const weeklyPlan = {
    Monday: [
      'Wake up at 8:00 AM',
      '8:30 - 11:00 Product Management Videos',
      '12:00 - 1:00 MTL101',
      '3:00 - 6:00 AI Agents & Automation Videos',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Tuesday: [
      '8:00 - 10:00 MTL101',
      '11:00 - 12:00 Cold Mailing',
      '3:00 - 6:00 AI Agents & Automation',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Wednesday: [
      '8:00 - 10:00 MTL101',
      '12:00 - 1:00 Product Management',
      '3:00 - 6:00 AI Agentic Automation',
      '6:00 - 7:30 Gym',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Thursday: [
      '9:00 - 12:00 Product Management Videos',
      '2:30 - 6:00 AI Agents Automation Videos',
      '6:00 - 7:30 Gym',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Friday: [
      '9:00 - 12:00 Product Management Videos',
      '2:30 - 6:00 AI Agents Automation Videos',
      '6:00 - 7:30 Gym',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Saturday: [
      '9:00 - 12:00 Product Management Videos',
      '2:30 - 6:00 AI Agents Automation Videos',
      '6:00 - 7:30 Gym',
      'Dinner Break',
      'Saudafy + Moj Masti Work',
      'Sleep before 2:00 AM',
    ],
    Sunday: ['OFF DAY ☕'],
  };

  const productivityData = [
    { name: 'Mon', tasks: 7 },
    { name: 'Tue', tasks: 6 },
    { name: 'Wed', tasks: 7 },
    { name: 'Thu', tasks: 6 },
    { name: 'Fri', tasks: 6 },
    { name: 'Sat', tasks: 6 },
  ];

  const consistencyData = [
    { name: 'Completed', value: 82 },
    { name: 'Remaining', value: 18 },
  ];

  const focusData = [
    {
      name: 'Focus',
      value: 78,
      fill: '#22c55e',
    },
  ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <h1 className="site-title">Weekly Routine Tracker</h1>
        <p className="site-subtitle">
          Product Management • AI Agents • Saudafy • Gym • Deep Work
        </p>
      </header>

      <section className="card-grid">
        {Object.entries(weeklyPlan).map(([day, tasks]) => (
          <article key={day} className="card">
            <div className="card-header">
              <h2 className="card-title">{day}</h2>
              <span className="status-pill" aria-label="active day"></span>
            </div>

            <div className="tasks-list">
              {tasks.map((task, index) => (
                <label key={index} className="task-item">
                  <input type="checkbox" className="task-checkbox" />
                  <p className="task-label">{task}</p>
                </label>
              ))}
            </div>

            <textarea
              className="notes-textarea"
              placeholder="Write notes for the day..."
              aria-label={`Notes for ${day}`}
            ></textarea>
          </article>
        ))}
      </section>

      <section>
        <h2 className="section-title">Interactive Weekly Report</h2>

        <div className="chart-grid">
          <div className="chart-card">
            <h3>Weekly Productivity Graph</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#22c55e"
                  strokeWidth={4}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Weekly Completion Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consistencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#334155" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-annotation">82%</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="small-card center-content">
            <h3>Focus Score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={18}
                data={focusData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar minAngle={15} background clockWise dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="chart-annotation">78%</div>
          </div>

          <div className="small-card center-content">
            <div className="small-card emoji">🔥</div>
            <h3>6 Day Streak</h3>
            <p>You are staying consistent with deep work and learning.</p>
          </div>

          <div className="small-card center-content">
            <div className="small-card emoji">🚀</div>
            <h3>Growth Meter</h3>
            <p>Product Management + AI Automation progress improving weekly.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="bottom-grid">
          <div className="small-card center-content">
            <h3>Sleep Tracker</h3>
            <div className="emoji-display">😴</div>
          </div>
          <div className="small-card center-content">
            <h3>Gym Consistency</h3>
            <div className="emoji-display">💪</div>
          </div>
          <div className="small-card center-content">
            <h3>Deep Work</h3>
            <div className="emoji-display">🧠</div>
          </div>
          <div className="small-card center-content">
            <h3>Weekly Wins</h3>
            <div className="emoji-display">🏆</div>
          </div>
        </div>
      </section>

      <div className="footer-note">
        Built for Aditya • Stay Consistent • Keep Building 🚀
      </div>
    </div>
  );
}

// Render the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<RoutineTracker />);
  });
} else {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<RoutineTracker />);
}
