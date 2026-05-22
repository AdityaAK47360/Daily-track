// Initialize app when all libraries are loaded
function initializeApp() {
  if (!window.React || !window.ReactDOM) {
    console.error('React not loaded yet');
    setTimeout(initializeApp, 500);
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const Recharts = window.Recharts || {};

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

    return React.createElement('div', { className: 'app-shell' },
      React.createElement('header', { className: 'site-header' },
        React.createElement('h1', { className: 'site-title' }, 'Weekly Routine Tracker'),
        React.createElement('p', { className: 'site-subtitle' }, 'Product Management • AI Agents • Saudafy • Gym • Deep Work')
      ),
      React.createElement('section', { className: 'card-grid' },
        Object.entries(weeklyPlan).map(([day, tasks]) =>
          React.createElement('article', { key: day, className: 'card' },
            React.createElement('div', { className: 'card-header' },
              React.createElement('h2', { className: 'card-title' }, day),
              React.createElement('span', { className: 'status-pill' })
            ),
            React.createElement('div', { className: 'tasks-list' },
              tasks.map((task, index) =>
                React.createElement('label', { key: index, className: 'task-item' },
                  React.createElement('input', { type: 'checkbox', className: 'task-checkbox' }),
                  React.createElement('p', { className: 'task-label' }, task)
                )
              )
            ),
            React.createElement('textarea', { className: 'notes-textarea', placeholder: 'Write notes for the day...' })
          )
        )
      ),
      React.createElement('section', null,
        React.createElement('h2', { className: 'section-title' }, 'Interactive Weekly Report'),
        React.createElement('div', { className: 'chart-grid' },
          React.createElement('div', { className: 'chart-card' },
            React.createElement('h3', null, 'Weekly Productivity Graph'),
            Recharts.ResponsiveContainer ? React.createElement(Recharts.ResponsiveContainer, { width: '100%', height: 300 },
              React.createElement(Recharts.LineChart, { data: productivityData },
                React.createElement(Recharts.CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155' }),
                React.createElement(Recharts.XAxis, { dataKey: 'name', stroke: '#cbd5e1' }),
                React.createElement(Recharts.YAxis, { stroke: '#cbd5e1' }),
                React.createElement(Recharts.Tooltip),
                React.createElement(Recharts.Line, { type: 'monotone', dataKey: 'tasks', stroke: '#22c55e', strokeWidth: 4, dot: { r: 6 } })
              )
            ) : React.createElement('p', null, 'Loading...')
          ),
          React.createElement('div', { className: 'chart-card' },
            React.createElement('h3', null, 'Weekly Completion Rate'),
            Recharts.ResponsiveContainer ? React.createElement(Recharts.ResponsiveContainer, { width: '100%', height: 300 },
              React.createElement(Recharts.PieChart, null,
                React.createElement(Recharts.Pie, { data: consistencyData, cx: '50%', cy: '50%', innerRadius: 70, outerRadius: 110, paddingAngle: 5, dataKey: 'value' },
                  React.createElement(Recharts.Cell, { fill: '#22c55e' }),
                  React.createElement(Recharts.Cell, { fill: '#334155' })
                ),
                React.createElement(Recharts.Tooltip)
              )
            ) : React.createElement('p', null, 'Loading...'),
            React.createElement('div', { className: 'chart-annotation' }, '82%')
          )
        ),
        React.createElement('div', { className: 'stats-grid' },
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Focus Score'),
            Recharts.ResponsiveContainer ? React.createElement(Recharts.ResponsiveContainer, { width: '100%', height: 220 },
              React.createElement(Recharts.RadialBarChart, { cx: '50%', cy: '50%', innerRadius: '70%', outerRadius: '100%', barSize: 18, data: focusData, startAngle: 180, endAngle: 0 },
                React.createElement(Recharts.RadialBar, { minAngle: 15, background: true, clockWise: true, dataKey: 'value' })
              )
            ) : React.createElement('p', null, 'Loading...'),
            React.createElement('div', { className: 'chart-annotation' }, '78%')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('div', { className: 'emoji-display' }, '🔥'),
            React.createElement('h3', null, '6 Day Streak'),
            React.createElement('p', null, 'You are staying consistent with deep work and learning.')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('div', { className: 'emoji-display' }, '🚀'),
            React.createElement('h3', null, 'Growth Meter'),
            React.createElement('p', null, 'Product Management + AI Automation progress improving weekly.')
          )
        )
      ),
      React.createElement('section', null,
        React.createElement('div', { className: 'bottom-grid' },
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Sleep Tracker'),
            React.createElement('div', { className: 'emoji-display' }, '😴')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Gym Consistency'),
            React.createElement('div', { className: 'emoji-display' }, '💪')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Deep Work'),
            React.createElement('div', { className: 'emoji-display' }, '🧠')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Weekly Wins'),
            React.createElement('div', { className: 'emoji-display' }, '🏆')
          )
        )
      ),
      React.createElement('div', { className: 'footer-note' }, 'Built for Aditya • Stay Consistent • Keep Building 🚀')
    );
  }

  // Render the app
  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(RoutineTracker));
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
}

// Initialize app when all scripts are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
