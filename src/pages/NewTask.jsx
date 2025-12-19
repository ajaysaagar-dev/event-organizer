import { useState, useEffect } from "react";
import { Plus, UserPlus, Clock, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config/api";
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
    const res = await fetch(`${API_URL}/tasks/work/${user.id}`);
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadProfiles = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setProfiles(Array.isArray(data) ? data.filter(u => u.id !== user.id) : []);
  };

  /* ---------- ACTIONS ---------- */

  const handleCompleteTask = async (taskId) => {
    await fetch(`${API_URL}/tasks/${taskId}/complete/${user.id}`, {
      method: "PUT",
    });
    loadTasks();
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!title || assignedUsers.length === 0) return;

    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        assigned_to: assignedUsers,
        assigned_by: user.id,
        due_date: dueDate || null,
        has_reminder: hasReminder,
        is_urgent: isUrgent,
      }),
    });

    if (!res.ok) return;

    setTitle("");
    setDescription("");
    setAssignedUsers([]);
    setDueDate("");
    setHasReminder(false);
    setIsUrgent(false);

    setActiveTab("work");
    loadTasks();
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

                {/* ✅ DATE PICKER (FIXED) */}
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
