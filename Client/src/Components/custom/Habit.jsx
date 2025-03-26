import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Video from "./Video"; // Import Video component
import "./Habit.css";

function Habit() {
  const navigate = useNavigate();
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
      alert("Habit added successfully!");
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("Failed to add habit. Please try again.");
    }
  };

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/habits/${id}`);
      loadHabits(); // Refresh the list
      alert("Habit deleted successfully!");
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
      alert("Habit updated successfully!");
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
    navigate("/report");
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
    <div className="habit-container flex h-screen bg-gradient-to-r from-teal-100 to-white">
      <div className="sidebar w-1/4 bg-white shadow-lg p-6 rounded-lg">
        <div className="profile flex flex-col items-center">
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
          <label htmlFor="photoUpload" className="cursor-pointer">
            <img
              id="profilePic"
              src={userInfo.profilePic}
              alt="Profile Photo"
              className="w-24 h-24 rounded-full border-2 border-teal-500 mb-4"
            />
          </label>
          <input
            type="text"
            id="userName"
            placeholder="Enter Your Good Name"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            className="border-2 border-teal-500 rounded-lg p-2 text-center mb-2 w-full"
          />
          <p id="displayName" className="text-lg font-semibold text-teal-600">
            Welcome, {userInfo.name || "User"}
          </p>
        </div>

        <div className="menu mt-6">
          <h3 className="font-bold text-lg mb-2 text-teal-600">Time Sections</h3>
          <ul className="space-y-2">
            <li className="cursor-pointer hover:text-teal-500" onClick={() => setActiveSection("morning")}>🌅 Morning</li>
            <li className="cursor-pointer hover:text-teal-500" onClick={() => setActiveSection("noon")}>☀️ Noon</li>
            <li className="cursor-pointer hover:text-teal-500" onClick={() => setActiveSection("evening")}>🌙 Evening</li>
            <li className="cursor-pointer hover:text-teal-500" onClick={() => setActiveSection("report")}>🏆 Report</li>
            <li className="cursor-pointer hover:text-teal-500" onClick={() => setActiveSection("video")}>🎬 Video</li>
          </ul>
        </div>
      </div>

      <div className="content w-3/4 p-6 bg-white rounded-lg shadow-md overflow-y-auto">
        {loading && <p className="text-gray-500">Loading habits...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {(activeSection === "morning" || activeSection === "noon" || activeSection === "evening") && (
          <div className="habit-section bg-gray-100 shadow-md rounded-lg p-5 mt-4">
            <h3 className="text-3xl font-semibold text-teal-700 mb-4">
              {activeSection === "morning" ? "🌅 Morning Habits" : activeSection === "noon" ? "☀️ Noon Habits" : "🌙 Evening Habits"}
            </h3>
            <div className="flex items-center mb-4">
              <input
                type="text"
                placeholder="Add a new habit..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                className="border-2 border-teal-500 rounded-lg p-2 flex-grow"
              />
              <button onClick={addHabitToDatabase} className="bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 ml-2">ADD</button>
            </div>

            {editingHabit && (
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={editingHabitName}
                  onChange={(e) => setEditingHabitName(e.target.value)}
                  className="border-2 border-teal-500 rounded-lg p-2 flex-grow"
                />
                <button onClick={saveEditedHabit} className="bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 ml-2">SAVE</button>
                <button onClick={() => setEditingHabit(null)} className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 ml-2">CANCEL</button>
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
          <div className="report-section bg-gray-100 shadow-md rounded-lg p-5 mt-4">
            <h3 className="text-3xl font-semibold text-teal-700 mb-4">🏆 Report</h3>
            <p className="text-lg text-gray-700">
              Completed {calculateCompletedHabits()} out of {calculateTotalHabits()} habits.
            </p>
            <button onClick={handleSubmitProgress} className="bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 mt-4">Submit Progress</button>
          </div>
        )}

        {activeSection === "video" && <Video />}
      </div>
    </div>
  );
}

export default Habit;
