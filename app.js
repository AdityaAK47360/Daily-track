// Initialize app when all libraries are loaded
function initializeApp() {
  if (!window.React || !window.ReactDOM) {
    console.error('React not loaded yet');
    setTimeout(initializeApp, 500);
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useEffect, useState } = React;
  const Recharts = window.Recharts || {};

  const defaultPlan = {
    Monday: ['Wake up at 8:00 AM', '8:30 - 11:00 Product Management Videos', '12:00 - 1:00 MTL101', '3:00 - 6:00 AI Agents & Automation Videos', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Tuesday: ['8:00 - 10:00 MTL101', '11:00 - 12:00 Cold Mailing', '3:00 - 6:00 AI Agents & Automation', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Wednesday: ['8:00 - 10:00 MTL101', '12:00 - 1:00 Product Management', '3:00 - 6:00 AI Agentic Automation', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Thursday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Friday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Saturday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
    Sunday: ['OFF DAY ☕']
  };

  const createTaskId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const normalizePlan = (plan) => {
    const source = plan && typeof plan === 'object' ? plan : defaultPlan;
    return Object.fromEntries(Object.entries(source).map(([day, tasks]) => [
      day,
      Array.isArray(tasks)
        ? tasks.map(task => {
            if (typeof task === 'string') {
              return { id: createTaskId(), text: task, completed: false };
            }
            return {
              id: task.id || createTaskId(),
              text: task.text || '',
              completed: !!task.completed
            };
          })
        : []
    ]));
  };

  const loadSavedPlan = () => {
    try {
      const saved = localStorage.getItem('daily-track-plan');
      if (!saved) {
        return normalizePlan(defaultPlan);
      }
      return normalizePlan(JSON.parse(saved));
    } catch (error) {
      console.warn('Unable to load saved plan:', error);
      return normalizePlan(defaultPlan);
    }
  };

  const loadSavedNotes = () => {
    try {
      const saved = localStorage.getItem('daily-track-notes');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Unable to load saved notes:', error);
      return {};
    }
  };

  function RoutineTracker() {
    const [weeklyPlan, setWeeklyPlan] = useState(loadSavedPlan);
    const [notes, setNotes] = useState(loadSavedNotes);
    const [draftTasks, setDraftTasks] = useState({});

    useEffect(() => {
      try {
        localStorage.setItem('daily-track-plan', JSON.stringify(weeklyPlan));
      } catch (error) {
        console.warn('Unable to save plan:', error);
      }
    }, [weeklyPlan]);

    useEffect(() => {
      try {
        localStorage.setItem('daily-track-notes', JSON.stringify(notes));
      } catch (error) {
        console.warn('Unable to save notes:', error);
      }
    }, [notes]);

    const updateNotes = (day, value) => {
      setNotes(prev => ({ ...prev, [day]: value }));
    };

    const addTask = (day, text) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      setWeeklyPlan(prev => ({
        ...prev,
        [day]: [...(prev[day] || []), { id: createTaskId(), text: trimmed, completed: false }]
      }));
      setDraftTasks(prev => ({ ...prev, [day]: '' }));
    };

    const removeTask = (day, taskId) => {
      setWeeklyPlan(prev => ({
        ...prev,
        [day]: (prev[day] || []).filter(task => task.id !== taskId)
      }));
    };

    const updateTaskText = (day, taskId, text) => {
      setWeeklyPlan(prev => ({
        ...prev,
        [day]: (prev[day] || []).map(task => task.id === taskId ? { ...task, text } : task)
      }));
    };

    const toggleTask = (day, taskId) => {
      setWeeklyPlan(prev => ({
        ...prev,
        [day]: (prev[day] || []).map(task => task.id === taskId ? { ...task, completed: !task.completed } : task)
      }));
    };

    const calculateDayStats = (day) => {
      const tasks = weeklyPlan[day] || [];
      const completedCount = tasks.filter(task => task.completed).length;
      return { completed: completedCount, total: tasks.length };
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const productivityData = days.map(day => {
      const stats = calculateDayStats(day);
      return { name: day.slice(0, 3), tasks: stats.completed, total: stats.total };
    });

    const totalTasks = Object.values(weeklyPlan).reduce((sum, tasks) => sum + tasks.length, 0);
    const totalCompleted = Object.values(weeklyPlan).reduce((sum, tasks) => sum + tasks.filter(task => task.completed).length, 0);
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);

    const consistencyData = [
      { name: 'Completed', value: completionPercentage },
      { name: 'Remaining', value: 100 - completionPercentage }
    ];

    const focusData = [{ name: 'Focus', value: Math.min(completionPercentage * 1.2, 100), fill: '#22c55e' }];

    return React.createElement('div', { className: 'app-shell' },
      React.createElement('header', { className: 'site-header' },
        React.createElement('h1', { className: 'site-title' }, 'Weekly Routine Tracker'),
        React.createElement('p', { className: 'site-subtitle' }, 'Product Management • AI Agents • Saudafy • Gym • Deep Work')
      ),

      React.createElement('section', { className: 'card-grid' },
        Object.entries(weeklyPlan).map(([day, tasks]) => {
          const stats = calculateDayStats(day);
          const taskDraft = draftTasks[day] || '';

          return React.createElement('article', { key: day, className: 'card' },
            React.createElement('div', { className: 'card-header' },
              React.createElement('h2', { className: 'card-title' }, day),
              React.createElement('span', { className: 'status-badge' }, `${stats.completed}/${stats.total}`)
            ),
            React.createElement('div', { className: 'task-editor-row' },
              React.createElement('input', {
                type: 'text',
                className: 'task-add-input',
                placeholder: 'Add a task for ' + day,
                value: taskDraft,
                onChange: (event) => setDraftTasks(prev => ({ ...prev, [day]: event.target.value })),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    addTask(day, event.target.value);
                  }
                }
              }),
              React.createElement('button', {
                type: 'button',
                className: 'action-btn',
                onClick: () => addTask(day, taskDraft)
              }, 'Add')
            ),
            React.createElement('div', { className: 'tasks-list' },
              tasks.length === 0
                ? React.createElement('p', { className: 'empty-state' }, 'No tasks yet. Add one above to customize your day.')
                : tasks.map((task) =>
                    React.createElement('div', { key: task.id, className: 'task-item' },
                      React.createElement('div', { className: 'task-row' },
                        React.createElement('input', {
                          type: 'checkbox',
                          className: 'task-checkbox',
                          checked: !!task.completed,
                          onChange: () => toggleTask(day, task.id)
                        }),
                        React.createElement('input', {
                          type: 'text',
                          className: `editable-task-input ${task.completed ? 'completed' : ''}`,
                          value: task.text,
                          onChange: (event) => updateTaskText(day, task.id, event.target.value)
                        })
                      ),
                      React.createElement('button', {
                        type: 'button',
                        className: 'remove-btn',
                        onClick: () => removeTask(day, task.id)
                      }, 'Remove')
                    )
                  )
            ),
            React.createElement('textarea', {
              className: 'notes-textarea',
              placeholder: 'Add notes for ' + day + '...',
              value: notes[day] || '',
              onChange: (e) => updateNotes(day, e.target.value)
            })
          );
        })
      ),

      React.createElement('section', null,
        React.createElement('h2', { className: 'section-title' }, 'Weekly Progress Report'),
        React.createElement('div', { className: 'chart-grid' },
          React.createElement('div', { className: 'chart-card' },
            React.createElement('h3', null, 'Daily Completion Progress'),
            Recharts.ResponsiveContainer ? React.createElement(Recharts.ResponsiveContainer, { width: '100%', height: 300 },
              React.createElement(Recharts.LineChart, { data: productivityData },
                React.createElement(Recharts.CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155' }),
                React.createElement(Recharts.XAxis, { dataKey: 'name', stroke: '#cbd5e1' }),
                React.createElement(Recharts.YAxis, { stroke: '#cbd5e1' }),
                React.createElement(Recharts.Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: '1px solid #475569' } }),
                React.createElement(Recharts.Line, { type: 'monotone', dataKey: 'tasks', stroke: '#22c55e', strokeWidth: 3, dot: { r: 6 } })
              )
            ) : React.createElement('p', null, 'Loading...')
          ),
          React.createElement('div', { className: 'chart-card' },
            React.createElement('h3', null, 'Overall Completion'),
            Recharts.ResponsiveContainer ? React.createElement(Recharts.ResponsiveContainer, { width: '100%', height: 300 },
              React.createElement(Recharts.PieChart, null,
                React.createElement(Recharts.Pie, { data: consistencyData, cx: '50%', cy: '50%', innerRadius: 70, outerRadius: 110, paddingAngle: 5, dataKey: 'value' },
                  React.createElement(Recharts.Cell, { fill: '#22c55e' }),
                  React.createElement(Recharts.Cell, { fill: '#334155' })
                ),
                React.createElement(Recharts.Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: '1px solid #475569' } })
              )
            ) : React.createElement('p', null, 'Loading...'),
            React.createElement('div', { className: 'chart-annotation' }, completionPercentage + '%')
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
            React.createElement('div', { className: 'chart-annotation' }, Math.round(Math.min(completionPercentage * 1.2, 100)) + '%')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('div', { className: 'emoji-display' }, '🔥'),
            React.createElement('h3', null, 'Tasks Done'),
            React.createElement('p', null, totalCompleted + ' of ' + totalTasks + ' tasks completed')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('div', { className: 'emoji-display' }, '🚀'),
            React.createElement('h3', null, 'Growth Rate'),
            React.createElement('p', null, 'Track your daily progress and keep improving!')
          )
        )
      ),

      React.createElement('section', null,
        React.createElement('div', { className: 'bottom-grid' },
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Total Tasks'),
            React.createElement('div', { className: 'emoji-display' }, totalCompleted),
            React.createElement('p', null, 'Completed')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Remaining'),
            React.createElement('div', { className: 'emoji-display' }, totalTasks - totalCompleted),
            React.createElement('p', null, 'To Complete')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'This Week'),
            React.createElement('div', { className: 'emoji-display' }, '📊'),
            React.createElement('p', null, 'Stay focused & consistent')
          ),
          React.createElement('div', { className: 'small-card center-content' },
            React.createElement('h3', null, 'Motivation'),
            React.createElement('div', { className: 'emoji-display' }, '💪'),
            React.createElement('p', null, 'Keep building your dreams')
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
    console.log('App rendered successfully with state management');
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
