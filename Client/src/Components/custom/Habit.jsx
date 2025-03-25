import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import Video from "./Video"; // Import Video component
import "./Habit.css";

function Habit() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [userInfo, setUserInfo] = useState({
    name: "",
    profilePic: "default.png",
  });

  const [habits, setHabits] = useState({
    morning: [],
    noon: [],
    evening: [],
  });

  const [newHabit, setNewHabit] = useState("");
  const [activeSection, setActiveSection] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState("");

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:3000/habits");
      setHabits({
        morning: response.data.filter((habit) => habit.type === "morning"),
        noon: response.data.filter((habit) => habit.type === "noon"),
        evening: response.data.filter((habit) => habit.type === "evening"),
      });
    } catch (error) {
      console.error("Error loading habits:", error);
      setError("Failed to load habits. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addHabitToDatabase = async () => {
    if (!newHabit.trim()) return;

    const newHabitData = { name: newHabit, type: activeSection };
    try {
      await axios.post("http://localhost:3000/habits", newHabitData);
      loadHabits(); // Refresh the list
      setNewHabit(""); // Clear input after adding
      alert("Habit added successfully!"); // User feedback
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("Failed to add habit. Please try again.");
    }
  };

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/habits/${id}`);
      loadHabits(); // Refresh the list
      alert("Habit deleted successfully!"); // User feedback
    } catch (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit. Please try again.");
    }
  };

  const toggleHabit = async (id) => {
    const habitToUpdate = habits[activeSection].find(
      (habit) => habit._id === id
    );
    const updatedHabit = {
      ...habitToUpdate,
      completed: !habitToUpdate.completed,
    };
    try {
      await axios.put(`http://localhost:3000/habits/${id}`, updatedHabit);
      loadHabits(); // Refresh the list
    } catch (error) {
      console.error("Error updating habit:", error);
      alert("Failed to update habit. Please try again.");
    }
  };

  const startEditing = (habit) => {
    setEditingHabit(habit);
    setEditingHabitName(habit.name);
  };

  const saveEditedHabit = async () => {
    if (!editingHabitName.trim()) return;

    const updatedHabit = { ...editingHabit, name: editingHabitName };
    try {
      await axios.put(
        `http://localhost:3000/habits/${editingHabit._id}`,
        updatedHabit
      );
      loadHabits(); // Refresh the list
      setEditingHabit(null); // Clear editing state
      setEditingHabitName(""); // Clear input
      alert("Habit updated successfully!"); // User feedback
    } catch (error) {
      console.error("Error updating habit:", error);
      alert("Failed to update habit. Please try again.");
    }
  };

  const calculateCompletedHabits = () => {
    return [...habits.morning, ...habits.noon, ...habits.evening].filter(
      (habit) => habit.completed
    ).length;
  };

  const calculateTotalHabits = () => {
    return habits.morning.length + habits.noon.length + habits.evening.length;
  };

  const handleSubmitProgress = () => {
    alert("Progress submitted successfully!");
    navigate("/report"); // Use navigate instead of history.push
  };

  const HabitList = ({ habits, onDelete, onToggle, onEdit }) => (
    <ul>
      {habits.map((habit) => (
        <li
          key={habit._id}
          className={`habit-item ${habit.completed ? "completed" : ""}`}
        >
          <span
            onClick={() => onToggle(habit._id)}
            className={habit.completed ? "completed" : ""}
          >
            {habit.name}
          </span>
          <button className="edit-btn" onClick={() => onEdit(habit)}>
            EDIT
          </button>
          <button className="delete-btn" onClick={() => onDelete(habit._id)}>
            DELETE
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="habit-container">
      <div className="sidebar">
        <div className="profile">
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setUserInfo((prev) => ({
                    ...prev,
                    profilePic: reader.result,
                  }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <label htmlFor="photoUpload">
            <img
              id="profilePic"
              src={userInfo.profilePic}
              alt="Profile Photo"
            />
          </label>
          <input
            type="text"
            id="userName"
            placeholder="Enter Your Good Name"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
          />
          <p id="displayName">Welcome, {userInfo.name || "User "}</p>
        </div>

        <div className="menu">
          <h3>Time Sections</h3>
          <ul>
            <li onClick={() => setActiveSection("morning")}>🌅 Morning</li>
            <li onClick={() => setActiveSection("noon")}>☀️ Noon</li>
            <li onClick={() => setActiveSection("evening")}>🌙 Evening</li>
            <li onClick={() => setActiveSection("report")}>🏆 Report</li>
            <li onClick={() => setActiveSection("video")}>🎬 Video</li>
          </ul>
        </div>
      </div>

      <div className="content">
        {loading && <p>Loading habits...</p>}
        {error && <p className="error">{error}</p>}
        {(activeSection === "morning" ||
          activeSection === "noon" ||
          activeSection === "evening") && (
          <div className="habit-section">
            <h3>
              {activeSection === "morning"
                ? "🌅 Morning Habits"
                : activeSection === "noon"
                ? "☀️ Noon Habits"
                : "🌙 Evening Habits"}
            </h3>
            <input
              type="text"
              placeholder="Add a new habit..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
            />
            <button onClick={addHabitToDatabase}>ADD HABIT</button>

            {editingHabit && (
              <div>
                <input
                  type="text"
                  value={editingHabitName}
                  onChange={(e) => setEditingHabitName(e.target.value)}
                />
                <button onClick={saveEditedHabit}>SAVE</button>
                <button onClick={() => setEditingHabit(null)}>CANCEL</button>
              </div>
            )}

            <HabitList
              habits={habits[activeSection]}
              onDelete={deleteHabit}
              onToggle={toggleHabit}
              onEdit={startEditing}
            />
          </div>
        )}
        {activeSection === "report" && (
          <div className="habit-tracker">
            <h1>🏆 Your Progress Report</h1>
            <div className="progress-section">
              <h2>Overall Habit Progress</h2>
              <p>Total Habits: {calculateTotalHabits()}</p>
              <p>Completed Habits: {calculateCompletedHabits()}</p>
              <p>
                Progress:{" "}
                {calculateTotalHabits() > 0
                  ? Math.round(
                      (calculateCompletedHabits() / calculateTotalHabits()) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>

            <div className="habit-details">
              <h2>Habit Details by Section</h2>

              <div className="habit-category">
                <h3>🌅 Morning Habits</h3>
                <HabitList
                  habits={habits.morning}
                  onDelete={deleteHabit}
                  onToggle={toggleHabit}
                  onEdit={startEditing}
                />
              </div>

              <div className="habit-category">
                <h3>☀️ Noon Habits</h3>
                <HabitList
                  habits={habits.noon}
                  onDelete={deleteHabit}
                  onToggle={toggleHabit}
                  onEdit={startEditing}
                />
              </div>

              <div className="habit-category">
                <h3>🌙 Evening Habits</h3>
                <HabitList
                  habits={habits.evening}
                  onDelete={deleteHabit}
                  onToggle={toggleHabit}
                  onEdit={startEditing}
                />
              </div>
            </div>

            <button onClick={handleSubmitProgress} className="submit-btn">
              Submit Progress
            </button>
          </div>
        )}{" "}
        {activeSection === "video" && <Video />}{" "}
        {/* Render Video component here */}
      </div>
    </div>
  );
}

export default Habit;
