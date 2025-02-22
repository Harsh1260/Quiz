import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  
  const socialLinks = [
    { icon: "🐦", label: "Twitter", href: "https://twitter.com", color: "hover:text-sky-400" },
    { icon: "💼", label: "LinkedIn", href: "https://www.linkedin.com/in/harsh-jain-b071b424a/", color: "hover:text-blue-400" },
    { icon: "✉️", label: "Email", href: "mailto:harshjain1260@gmail.com", color: "hover:text-emerald-400" }
  ];

  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", to: "/" },
        { label: "Leaderboard", to: "/leaderboard" },
        { label: "Quizzes", to: "/quiz" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", to: "#" },
        { label: "Blog", to: "#" },
        { label: "FAQ", to: "#" },
        { label: "Terms", to: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-2xl">🎓</span>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
                Interactive Quiz Platform
              </h3>
            </div>
            <p className="text-sm text-gray-300 text-center md:text-left">
              Empowering minds through interactive learning. Challenge yourself and grow with our engaging quizzes!
            </p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="font-semibold text-lg text-center md:text-left">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx} className="text-center md:text-left">
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm inline-block
                        relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-emerald-400
                        after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {socialLinks.map((social, idx) => (
            <a
              key={idx}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transform transition-all duration-300 hover:-translate-y-1 ${social.color}`}
              onMouseEnter={() => setHoveredIcon(idx)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-2xl transition-transform duration-300 ${hoveredIcon === idx ? 'scale-125' : 'scale-100'}`}>
                  {social.icon}
                </span>
                <span className="text-sm">{social.label}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Interactive Quiz Platform. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <Link to="#" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
              <span>•</span>
              <Link to="#" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
