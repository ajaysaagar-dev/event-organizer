import { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { executeQuery } from "../utils/db";
import Navigation from "../components/Navigation";
import "../css/completed.css";

export default function Completed() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (user?.id) loadCompleted();
  }, [user?.id]);

  const loadCompleted = async () => {
    setLoading(true);
    
    // Get completed tasks assigned to current user with assignment info
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.completed_at,
        assignedBy.name as assigned_by_name,
        completedBy.name as completed_by_name
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users assignedBy ON t.assigned_by = assignedBy.id
      LEFT JOIN users completedBy ON t.completed_by = completedBy.id
      WHERE ta.user_id = ${user.id} AND t.completed = 1
      ORDER BY t.completed_at DESC
    `;
    
    const result = await executeQuery(query);
    
    if (result.success && result.rows) {
      setTasks(result.rows);
    } else {
      setTasks([]);
      console.error("Error loading completed tasks:", result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Navigation />

      <div className="completed-page">
        <div className="completed-header">
          <h1>
            <CheckCircle2 size={26} />
            Completed Tasks
          </h1>
          <p>Tasks you have successfully finished</p>
        </div>

        {loading ? (
          <div className="completed-loading">Loading completed tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="completed-empty">No completed tasks</div>
        ) : (
          <div className="completed-grid">
            {tasks.map(task => (
              <div
                key={task.id}
                className="completed-card"
                onClick={() => setSelectedTask(task)}
              >
                <h3>{task.title}</h3>

                <p className="completed-date">
                  Completed on{" "}
                  {task.completed_at
                    ? new Date(task.completed_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedTask.title}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedTask(null)}
              >
                <X size={18} />
              </button>
            </div>

            {selectedTask.description && (
              <p className="modal-desc">
                {selectedTask.description}
              </p>
            )}

            <p className="modal-info">
              Assigned by:{" "}
              <strong>
                {selectedTask.assigned_by_name}
              </strong>
            </p>

            <p className="modal-info">
              Completed by:{" "}
              <strong>
                {selectedTask.completed_by_name}
              </strong>
            </p>

            <p className="modal-info">
              Completed on:{" "}
              {selectedTask.completed_at
                ? new Date(
                    selectedTask.completed_at
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
