import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Trophy, Star, AlertCircle } from "lucide-react";

const characters = [
  { emoji: "🚀", name: "Astronaut", color: "bg-blue-500" },
  { emoji: "🧙", name: "Wizard", color: "bg-purple-500" },
  { emoji: "⚔️", name: "Knight", color: "bg-red-500" },
  { emoji: "🐉", name: "Dragon Tamer", color: "bg-green-500" },
  { emoji: "🕵️", name: "Detective", color: "bg-yellow-500" }
];

const Dashboard = ({ setUser }) => {
  const [name, setName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate();

  const startQuiz = () => {
    if (!name.trim()) {
      setError("Please enter your name to begin!");
      return;
    }
    if (!selectedCharacter) {
      setError("Please select your character!");
      return;
    }

    setError(""); // Clear error if all inputs are valid
    setIsLoading(true);

    setTimeout(() => {
      setUser({ name, character: `${selectedCharacter.emoji} ${selectedCharacter.name}` });
      navigate("/quiz");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto pt-8 pb-16">
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 bg-yellow-400 rounded-full p-3 shadow-lg">
            <Brain className="w-6 h-6 text-yellow-900" />
          </div>
          <div className="absolute -top-4 -right-4 bg-purple-400 rounded-full p-3 shadow-lg">
            <Trophy className="w-6 h-6 text-purple-900" />
          </div>

          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Welcome to the Ultimate Quiz!
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              Choose your character and embark on an epic journey of knowledge
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center bg-red-500/90 text-white text-sm md:text-base font-medium py-2 px-4 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Name Input Section */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-6 py-4 bg-white/20 rounded-lg border-2 border-white/30 text-white placeholder-white/50 text-lg focus:outline-none focus:border-white/50 transition-all"
              />
              <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>

          {/* Character Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {characters.map((char) => (
              <div
                key={char.name}
                onClick={() => setSelectedCharacter(char)}
                className={`${
                  selectedCharacter?.name === char.name
                    ? "ring-4 ring-white scale-105"
                    : "hover:scale-105"
                } ${char.color} p-4 rounded-lg text-center cursor-pointer transition-all duration-300`}
              >
                <div className="text-4xl mb-2">{char.emoji}</div>
                <div className="text-white font-medium">{char.name}</div>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startQuiz}
              disabled={isLoading}
              className={`px-8 py-4 text-lg font-bold rounded-lg
                bg-gradient-to-r from-yellow-400 to-orange-500
                hover:from-yellow-500 hover:to-orange-600
                transform hover:scale-105 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                text-black shadow-lg`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">⭐</span>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Star className="mr-2" />
                  Start Your Quest!
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
