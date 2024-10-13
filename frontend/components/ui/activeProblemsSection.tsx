import React from 'react';

interface ActiveProblem {
  problem: string;
  diagnosedDate: string;
}

interface ActiveProblemsSectionProps {
  activeProblems: ActiveProblem[];
}

const ActiveProblemsSection: React.FC<ActiveProblemsSectionProps> = ({ activeProblems }) => {
  return (
    <div style={{ backgroundColor: "#e8f8f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Active Problems</h3>
      {activeProblems.length > 0 ? (
        activeProblems.map((problem, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{problem.problem}</strong> (Diagnosed on {problem.diagnosedDate})
          </div>
        ))
      ) : (
        <p>No active problems reported.</p>
      )}
    </div>
  );
};

export default ActiveProblemsSection;
