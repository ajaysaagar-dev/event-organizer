import { useState, useEffect } from "react";
import { Bell, Clock, BellOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { executeQuery } from "../utils/db";
import "../css/reminder.css";
import Navigation from "../components/Navigation";

export default function Reminder() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user?.id) loadReminders();
  }, [user?.id]);

  const loadReminders = async () => {
    setLoading(true);
    
    // Get tasks with reminders assigned to current user
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.created_at,
        assignedBy.name as assigned_by_name
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users assignedBy ON t.assigned_by = assignedBy.id
      WHERE ta.user_id = ${user.id} 
        AND t.has_reminder = 1 
        AND t.completed = 0
      ORDER BY t.due_date ASC, t.created_at DESC
    `;
    
    const result = await executeQuery(query);
    
    if (result.success && result.rows) {
      setTasks(result.rows);
    } else {
      setTasks([]);
      console.error("Error loading reminders:", result.error);
    }
    
    setLoading(false);
  };

  const stopReminder = async (completed) => {
    // Update task: stop reminder and optionally mark as completed
    const completedSql = completed ? `completed = 1, completed_by = ${user.id}, completed_at = NOW(),` : '';
    const query = `
      UPDATE tasks 
      SET ${completedSql} has_reminder = 0
      WHERE id = ${selectedTask.id}
    `;
    
    const result = await executeQuery(query);
    
    if (!result.success) {
      alert("Failed to stop reminder: " + result.error);
    }

    setShowConfirm(false);
    setSelectedTask(null);
    loadReminders();
  };

  return (
    <>
      <Navigation />

      <div className="reminder-page">
        <div className="reminder-header">
          <h1>
            <Bell size={26} />
            Reminder
          </h1>
          <p>Tasks with active reminders</p>
        </div>

        {loading ? (
          <div className="reminder-loading">Loading reminders…</div>
        ) : tasks.length === 0 ? (
          <div className="reminder-empty">No reminders</div>
        ) : (
          <div className="reminder-list">
            {tasks.map(task => (
              <div
                className="reminder-card"
                key={task.id}
                onClick={() => setSelectedTask(task)}
              >
                <div className="reminder-left">
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p className="reminder-desc">{task.description}</p>
                  )}

                  {task.due_date && (
                    <div className="reminder-date">
                      <Clock size={14} />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <button
                  className="reminder-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setShowConfirm(true);
                  }}
                >
                  <BellOff size={16} />
                  Stop Reminder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && showConfirm && (
        <div className="reminder-modal-overlay">
          <div className="reminder-modal">
            <h2>{selectedTask.title}</h2>

            <p>{selectedTask.description}</p>

            <p className="reminder-info">
              Assigned by: <strong>{selectedTask.assigned_by_name}</strong>
            </p>

            <p className="reminder-info">
              Created on:{" "}
              {new Date(selectedTask.created_at).toLocaleDateString()}
            </p>

            <p className="reminder-info">
              Due by:{" "}
              {selectedTask.due_date
                ? new Date(selectedTask.due_date).toLocaleDateString()
                : "No deadline"}
            </p>

            <p>Did you complete this task?</p>

            <div className="reminder-modal-actions">
              <button
                className="reminder-confirm"
                onClick={() => stopReminder(true)}
              >
                Yes, Completed
              </button>

              <button
                className="reminder-cancel"
                onClick={() => stopReminder(false)}
              >
                No, Just Stop Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
