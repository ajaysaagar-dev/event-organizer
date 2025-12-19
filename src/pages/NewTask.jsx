import { useState, useEffect } from "react";
import { Plus, UserPlus, Clock, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { executeQuery, escapeSql, formatSqlDate, formatSqlBoolean } from "../utils/db";
import "../css/newtask.css";
import Navigation from "../components/Navigation";

export default function NewTask() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("work");
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const [hasReminder, setHasReminder] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!user?.id) return;
    loadTasks();
    loadProfiles();
  }, [user?.id]);

  const loadTasks = async () => {
    setLoading(true);
    
    // Get tasks assigned to current user that are not completed
    const query = `
      SELECT t.id, t.title, t.description, t.has_reminder, t.is_urgent, t.due_date
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      WHERE ta.user_id = ${user.id} AND t.completed = 0
      ORDER BY t.created_at DESC
    `;
    
    const result = await executeQuery(query);
    
    if (result.success && result.rows) {
      setTasks(result.rows);
    } else {
      setTasks([]);
      console.error("Error loading tasks:", result.error);
    }
    
    setLoading(false);
  };

  const loadProfiles = async () => {
    // Get all users except current user
    const query = `SELECT id, name FROM users WHERE id != ${user.id} ORDER BY name`;
    const result = await executeQuery(query);
    
    if (result.success && result.rows) {
      setProfiles(result.rows);
    } else {
      setProfiles([]);
      console.error("Error loading profiles:", result.error);
    }
  };

  /* ---------- ACTIONS ---------- */

  const handleCompleteTask = async (taskId) => {
    // Mark task as completed
    const query = `UPDATE tasks SET completed = 1, completed_by = ${user.id}, completed_at = NOW() WHERE id = ${taskId}`;
    const result = await executeQuery(query);
    
    if (result.success) {
      loadTasks();
    } else {
      alert("Failed to complete task: " + result.error);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!title || assignedUsers.length === 0) return;

    try {
      // Insert task
      const insertTaskQuery = `
        INSERT INTO tasks (title, description, assigned_by, due_date, has_reminder, is_urgent, completed, created_at)
        VALUES (
          ${escapeSql(title)},
          ${escapeSql(description)},
          ${user.id},
          ${dueDate ? formatSqlDate(dueDate) : 'NULL'},
          ${formatSqlBoolean(hasReminder)},
          ${formatSqlBoolean(isUrgent)},
          0,
          NOW()
        )
      `;
      
      const taskResult = await executeQuery(insertTaskQuery);
      
      if (!taskResult.success) {
        alert("Failed to create task: " + taskResult.error);
        return;
      }

      // Get the last inserted task ID
      const getIdQuery = `SELECT LAST_INSERT_ID() as task_id`;
      const idResult = await executeQuery(getIdQuery);
      
      if (!idResult.success || !idResult.rows || idResult.rows.length === 0) {
        alert("Task created but failed to get task ID");
        return;
      }
      
      const taskId = idResult.rows[0].task_id;

      // Insert task assignments for each assigned user
      for (const userId of assignedUsers) {
        const assignQuery = `INSERT INTO task_assignments (task_id, user_id, assigned_at) VALUES (${taskId}, ${userId}, NOW())`;
        await executeQuery(assignQuery);
      }

      // Reset form
      setTitle("");
      setDescription("");
      setAssignedUsers([]);
      setDueDate("");
      setHasReminder(false);
      setIsUrgent(false);

      setActiveTab("work");
      loadTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task");
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <Navigation />

      <div className="newtask-page">
        <div className="newtask-header">
          <h1>New Tasks</h1>
          <p>Manage and assign tasks</p>
        </div>

        <div className="newtask-card">
          <div className="newtask-tabs">
            <button
              className={`newtask-tab ${activeTab === "work" ? "active" : ""}`}
              onClick={() => setActiveTab("work")}
            >
              <Clock size={18} />
              Work on Tasks
            </button>

            <button
              className={`newtask-tab ${activeTab === "assign" ? "active" : ""}`}
              onClick={() => setActiveTab("assign")}
            >
              <UserPlus size={18} />
              Assign Tasks
            </button>
          </div>

          <div className="newtask-content">
            {activeTab === "work" ? (
              loading ? (
                <div className="newtask-empty">Loading…</div>
              ) : tasks.length === 0 ? (
                <div className="newtask-empty">No tasks assigned</div>
              ) : (
                <div className="newtask-list">
                  {tasks.map(task => (
                    <div key={task.id} className="newtask-item">
                      <div>
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        {task.has_reminder && (
                          <div className="newtask-reminder">
                            <Bell size={14} />
                            {task.is_urgent ? "Urgent Reminder" : "Reminder"}
                          </div>
                        )}
                      </div>

                      <button
                        className="newtask-btn-start"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <form className="newtask-form" onSubmit={handleAssignTask}>
                <input
                  className="newtask-input"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <textarea
                  className="newtask-textarea"
                  placeholder="Task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="user-checkbox-list">
                  {profiles.map(p => (
                    <label key={p.id} className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={assignedUsers.includes(p.id)}
                        onChange={(e) =>
                          setAssignedUsers(
                            e.target.checked
                              ? [...assignedUsers, p.id]
                              : assignedUsers.filter(id => id !== p.id)
                          )
                        }
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>

                <input
                  type="date"
                  className="newtask-input"
                  min={new Date().toISOString().split("T")[0]}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <div className="newtask-checkbox-group">
                  <label className="newtask-checkbox">
                    <input
                      type="checkbox"
                      checked={hasReminder}
                      onChange={(e) => setHasReminder(e.target.checked)}
                    />
                    <span>Reminder</span>
                  </label>

                  <label className="newtask-checkbox">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                    />
                    <span>Urgent</span>
                  </label>
                </div>

                <button type="submit" className="newtask-submit">
                  <Plus size={18} />
                  Assign Task
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
