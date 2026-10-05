import React from 'react';
import { 
  Code2, 
  Globe, 
  Cpu, 
  BookOpen, 
  Database, 
  Network, 
  HelpCircle,
  Sparkles 
} from 'lucide-react';

const SUGGESTIONS = [
  {
    category: 'Programming',
    icon: Code2,
    text: 'What is Python?',
    subtext: 'Learn about Python language, syntax, and where it is used',
  },
  {
    category: 'Web Development',
    icon: Globe,
    text: 'Explain HTML.',
    subtext: 'Understand web structure, semantic tags, and basic page layout',
  },
  {
    category: 'C Programming',
    icon: Code2,
    text: 'Write a C program.',
    subtext: 'Generate a clean, commented C program with explanation',
  },
  {
    category: 'AI & Science',
    icon: Cpu,
    text: 'What is Artificial Intelligence?',
    subtext: 'Core concepts, machine learning, neural networks, and applications',
  },
  {
    category: 'Education',
    icon: BookOpen,
    text: 'Help me learn English.',
    subtext: 'Vocabulary, grammar tips, conversational practice, and common phrases',
  },
  {
    category: 'Databases',
    icon: Database,
    text: 'What is a database?',
    subtext: 'Relational vs NoSQL, tables, queries, and ACID properties',
  },
];

export default function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="empty-state">
      <div className="empty-hero">
        <div className="hero-icon-container">
          <Sparkles className="hero-sparkle" size={32} />
        </div>
        <h2 className="empty-title">How can I help you today?</h2>
        <p className="empty-description">
          Ask any question — programming, educational concepts, technical explanations, or general knowledge.
          Every response is powered dynamically by a real LLM.
        </p>
      </div>

      <div className="suggestions-grid">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              className="suggestion-card"
              onClick={() => onSelectSuggestion(item.text)}
            >
              <div className="card-top">
                <span className="card-category">{item.category}</span>
                <Icon size={18} className="card-icon" />
              </div>
              <h3 className="card-prompt">{item.text}</h3>
              <p className="card-subtext">{item.subtext}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
