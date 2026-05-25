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
        ? tasks.map((task) => {
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

  const TOKEN_KEY = 'daily-track-token';

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(typeof payload === 'string' ? payload : payload.error || 'Request failed');
    }

    return payload;
  };

  function RoutineTracker() {
    const [weeklyPlan, setWeeklyPlan] = useState(normalizePlan(defaultPlan));
    const [notes, setNotes] = useState({});
    const [globalTaskText, setGlobalTaskText] = useState('');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [authMode, setAuthMode] = useState('login');
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authConfirmPassword, setAuthConfirmPassword] = useState('');
    const [authMessage, setAuthMessage] = useState('Sign in or create an account to save your progress.');
    const [activeUser, setActiveUser] = useState('');
    const [sessionToken, setSessionToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
    const [isLoadingSession, setIsLoadingSession] = useState(false);

    useEffect(() => {
      if (!sessionToken) {
        return;
      }

      let cancelled = false;
      setIsLoadingSession(true);

      apiRequest('/api/me', {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      })
        .then((response) => {
          if (cancelled) {
            return;
          }

          setActiveUser(response.user);
          setWeeklyPlan(normalizePlan(response.plan));
          setNotes(response.notes || {});
          setAuthMessage(`Signed in as ${response.user}.`);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          localStorage.removeItem(TOKEN_KEY);
          setSessionToken('');
          setActiveUser('');
          setWeeklyPlan(normalizePlan(defaultPlan));
          setNotes({});
          setAuthMessage('Session expired. Please sign in again.');
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingSession(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [sessionToken]);

    useEffect(() => {
      if (!sessionToken || !activeUser) {
        return;
      }

      const saveTimer = setTimeout(() => {
        apiRequest('/api/save', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ plan: weeklyPlan, notes })
        }).catch(() => {
          setAuthMessage('Unable to sync changes right now. Please try again.');
        });
      }, 250);

      return () => clearTimeout(saveTimer);
    }, [weeklyPlan, notes, sessionToken, activeUser]);

    const handleAuth = async (mode) => {
      const username = authUsername.trim();
      const password = authPassword.trim();

      if (!username || !password) {
        setAuthMessage('Enter both a username and password.');
        return;
      }

      if (mode === 'register' && password !== authConfirmPassword) {
        setAuthMessage('Passwords do not match.');
        return;
      }

      try {
        const response = await apiRequest(`/api/${mode}`, {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });

        localStorage.setItem(TOKEN_KEY, response.token);
        setSessionToken(response.token);
        setActiveUser(response.user);
        setWeeklyPlan(normalizePlan(response.plan));
        setNotes(response.notes || {});
        setAuthMessage(mode === 'register' ? `Account created for ${response.user}.` : `Signed in as ${response.user}.`);
        setAuthPassword('');
        setAuthConfirmPassword('');
      } catch (error) {
        setAuthMessage(error.message);
      }
    };

    const handleLogout = async () => {
      if (sessionToken) {
        try {
          await apiRequest('/api/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionToken}`
            }
          });
        } catch (error) {
          console.warn('Unable to clear session on server:', error);
        }
      }

      localStorage.removeItem(TOKEN_KEY);
      setSessionToken('');
      setActiveUser('');
      setWeeklyPlan(normalizePlan(defaultPlan));
      setNotes({});
      setAuthMessage('Signed out. Sign in again to save your progress.');
      setAuthPassword('');
      setAuthConfirmPassword('');
    };

    const updateNotes = (day, value) => {
      setNotes((prev) => ({ ...prev, [day]: value }));
    };

    const addTask = (day, text) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      setWeeklyPlan((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), { id: createTaskId(), text: trimmed, completed: false }]
      }));
    };

    const handleGlobalAdd = () => {
      if (!globalTaskText.trim()) {
        return;
      }

      addTask(selectedDay, globalTaskText);
      setGlobalTaskText('');
    };

    const removeTask = (day, taskId) => {
      setWeeklyPlan((prev) => ({
        ...prev,
        [day]: (prev[day] || []).filter((task) => task.id !== taskId)
      }));
    };

    const updateTaskText = (day, taskId, text) => {
      setWeeklyPlan((prev) => ({
        ...prev,
        [day]: (prev[day] || []).map((task) => (task.id === taskId ? { ...task, text } : task))
      }));
    };

    const toggleTask = (day, taskId) => {
      setWeeklyPlan((prev) => ({
        ...prev,
        [day]: (prev[day] || []).map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
      }));
    };

    const calculateDayStats = (day) => {
      const tasks = weeklyPlan[day] || [];
      const completedCount = tasks.filter((task) => task.completed).length;
      return { completed: completedCount, total: tasks.length };
    };

    const selectableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const productivityData = days.map((day) => {
      const stats = calculateDayStats(day);
      return { name: day.slice(0, 3), tasks: stats.completed, total: stats.total };
    });

    const totalTasks = Object.values(weeklyPlan).reduce((sum, tasks) => sum + tasks.length, 0);
    const totalCompleted = Object.values(weeklyPlan).reduce((sum, tasks) => sum + tasks.filter((task) => task.completed).length, 0);
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

      React.createElement('section', { className: 'auth-panel' },
        React.createElement('div', { className: 'auth-card' },
          React.createElement('div', { className: 'auth-card-header' },
            React.createElement('h2', { className: 'auth-card-title' }, activeUser ? `Signed in as ${activeUser}` : 'Create an account to save your progress'),
            React.createElement('p', { className: 'auth-message' }, isLoadingSession ? 'Loading your saved data...' : authMessage)
          ),
          activeUser
            ? React.createElement('div', { className: 'auth-actions' },
                React.createElement('button', {
                  type: 'button',
                  className: 'action-btn',
                  onClick: handleLogout
                }, 'Log out')
              )
            : React.createElement('div', null,
                React.createElement('div', { className: 'auth-form-grid' },
                  React.createElement('input', {
                    type: 'text',
                    className: 'auth-input',
                    placeholder: 'Username',
                    value: authUsername,
                    onChange: (event) => setAuthUsername(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAuth(authMode);
                      }
                    }
                  }),
                  React.createElement('input', {
                    type: 'password',
                    className: 'auth-input',
                    placeholder: 'Password',
                    value: authPassword,
                    onChange: (event) => setAuthPassword(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAuth(authMode);
                      }
                    }
                  }),
                  authMode === 'register' && React.createElement('input', {
                    type: 'password',
                    className: 'auth-input',
                    placeholder: 'Confirm password',
                    value: authConfirmPassword,
                    onChange: (event) => setAuthConfirmPassword(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAuth(authMode);
                      }
                    }
                  })
                ),
                React.createElement('div', { className: 'auth-actions' },
                  React.createElement('button', {
                    type: 'button',
                    className: 'action-btn',
                    onClick: () => handleAuth(authMode)
                  }, authMode === 'login' ? 'Log in' : 'Create account'),
                  React.createElement('button', {
                    type: 'button',
                    className: 'secondary-btn',
                    onClick: () => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthMessage(authMode === 'login' ? 'Create a username and password to save your data.' : 'Use your saved username and password to continue.');
                    }
                  }, authMode === 'login' ? 'Create account' : 'Back to login')
                )
              )
        )
      ),

      React.createElement('section', { className: 'global-add-section' },
        React.createElement('div', { className: 'global-add-form' },
          React.createElement('input', {
            type: 'text',
            className: 'global-add-input',
            placeholder: 'Write a task to add globally',
            value: globalTaskText,
            onChange: (event) => setGlobalTaskText(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleGlobalAdd();
              }
            }
          }),
          React.createElement('select', {
            className: 'global-add-select',
            value: selectedDay,
            onChange: (event) => setSelectedDay(event.target.value)
          },
            selectableDays.map((day) => React.createElement('option', { key: day, value: day }, day))
          ),
          React.createElement('button', {
            type: 'button',
            className: 'action-btn global-add-button',
            onClick: handleGlobalAdd
          }, 'Add')
        )
      ),

      React.createElement('section', { className: 'card-grid' },
        Object.entries(weeklyPlan).map(([day, tasks]) => {
          const stats = calculateDayStats(day);

          return React.createElement('article', { key: day, className: 'card' },
            React.createElement('div', { className: 'card-header' },
              React.createElement('h2', { className: 'card-title' }, day),
              React.createElement('span', { className: 'status-badge' }, `${stats.completed}/${stats.total}`)
            ),
            React.createElement('div', { className: 'tasks-list' },
              tasks.length === 0
                ? React.createElement('p', { className: 'empty-state' }, 'No tasks yet. Add one from the global form to customize your day.')
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

  try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(RoutineTracker));
    console.log('App rendered successfully with backend sync');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
