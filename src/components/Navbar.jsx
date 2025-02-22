import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2 rounded-lg text-lg font-medium transition-all duration-300 ease-in-out hover:bg-emerald-400/10 ${isActive ? 'text-emerald-400' : 'text-white'} group flex items-center gap-2`}
  >
    <span className="text-2xl">{icon}</span>
    <span>{label}</span>
    {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 rounded-full" />}
    <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </button>
);

const Navbar = ({ isQuizOngoing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const handleNavigation = (route) => {
    setActiveTab(route);
    navigate(`/${route === "home" ? "" : route}`);
    setIsOpen(false);
  };

  const navItems = [
    { icon: "🏠", label: "Home", route: "home" },
    { icon: "🏆", label: "Leaderboard", route: "leaderboard" },
  ];

  return (
    <div className="relative z-50">
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />
      </div>
      
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable only if quiz is NOT ongoing */}
            <div className="flex-shrink-0 flex items-center">
              <button
                className={`text-2xl font-bold text-white transition-all duration-200 ${
                  isQuizOngoing ? "cursor-not-allowed opacity-50" : "hover:text-emerald-400"
                }`}
                onClick={() => !isQuizOngoing && handleNavigation("home")}
                disabled={isQuizOngoing}
              >
                Quiz<span className="text-emerald-400">Master</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.route}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeTab === item.route}
                  onClick={() => handleNavigation(item.route)}
                />
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-white hover:bg-emerald-400/10 transition-colors duration-200"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute w-full bg-gray-900/95 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden border-b border-emerald-400/20 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.route} className="w-full">
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  isActive={activeTab === item.route}
                  onClick={() => handleNavigation(item.route)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
