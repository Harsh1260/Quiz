import React, { useEffect, useState } from "react";
import { getAttempts } from "../utils/indexedDB";

function Leaderboard() {
  const [topScores, setTopScores] = useState([]);

  useEffect(() => {
    async function fetchTopScores() {
      const attempts = await getAttempts();
      setTopScores(attempts.sort((a, b) => b.score - a.score));
    }
    fetchTopScores();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-16 relative">
      <div className="w-full max-w-3xl p-8 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
          🏆 Leaderboard
        </h2>
        <p className="text-gray-300 mt-2">Top players of all time!</p>

        {/* Scrollable Container for Scores */}
        <div className="mt-8 max-h-96 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-transparent space-y-4">
          {topScores.length > 0 ? (
            topScores.map((attempt, index) => (
              <div
                key={index}
                className={`flex justify-between items-center px-6 py-3 rounded-xl transition-all duration-300 ${
                  index === 0
                    ? "bg-yellow-400 text-black font-bold scale-105 shadow-lg"
                    : index === 1
                    ? "bg-gray-300 text-black font-semibold"
                    : index === 2
                    ? "bg-amber-600 text-white font-semibold"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                <span className="text-lg flex items-center">
                  {index < 3 && <span className="text-2xl mr-2">{medals[index]}</span>}
                  {index + 1}. {attempt.name}
                </span>
                <span className="text-lg font-semibold">{attempt.score} / {attempt.total}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">No scores yet. Be the first to set a record!</p>
          )}
        </div>
      </div>
      
      {/* Floating Button to Scroll Up */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-10 right-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all duration-300"
      >
        ⬆
      </button>
    </div>
  );
}

export default Leaderboard;