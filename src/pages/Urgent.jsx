import { useState, useEffect } from "react";
import { AlertCircle, Clock, BellOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config/api";
import "../css/urgent.css";
import Navigation from "../components/Navigation";

export default function Urgent() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user?.id) loadUrgentTasks();
  }, [user?.id]);

  const loadUrgentTasks = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/tasks/urgent/${user.id}`);
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const stopReminder = async (completed) => {
    await fetch(
      `${API_URL}/tasks/${selectedTask.id}/stop-reminder/${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      }
    );

    setShowConfirm(false);
    setSelectedTask(null);
    loadUrgentTasks();
  };

  return (
    <>
      <Navigation />

      <div className="urgent-page">
        <div className="urgent-header">
          <h1>
            <AlertCircle size={26} />
            Urgent Tasks
          </h1>
          <p>Tasks that require immediate attention</p>
        </div>

        {loading ? (
          <div className="urgent-loading">Loading urgent tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="urgent-empty">No urgent tasks</div>
        ) : (
          <div className="urgent-list">
            {tasks.map(task => (
              <div
                className="urgent-card"
                key={task.id}
                onClick={() => setSelectedTask(task)}
              >
                <div className="urgent-card-left">
                  <h3>{task.title}</h3>

                  {task.description && (
                    <p className="urgent-desc">{task.description}</p>
                  )}

                  {task.due_date && (
                    <div className="urgent-date">
                      <Clock size={14} />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="urgent-actions">
                  <button
                    className="urgent-btn stop"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && showConfirm && (
        <div className="urgent-modal-overlay">
          <div className="urgent-modal">
            <h2>{selectedTask.title}</h2>

            <p>{selectedTask.description}</p>

            <p className="urgent-modal-info">
              Assigned by: <strong>{selectedTask.assigned_by_name}</strong>
            </p>

            <p className="urgent-modal-info">
              Created on:{" "}
              {new Date(selectedTask.created_at).toLocaleDateString()}
            </p>

            <p className="urgent-modal-info">
              Due by:{" "}
              {selectedTask.due_date
                ? new Date(selectedTask.due_date).toLocaleDateString()
                : "No deadline"}
            </p>

            <p>Did you complete this task?</p>

            <div className="urgent-modal-actions">
              <button
                className="urgent-confirm"
                onClick={() => stopReminder(true)}
              >
                Yes, Completed
              </button>

              <button
                className="urgent-cancel"
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
