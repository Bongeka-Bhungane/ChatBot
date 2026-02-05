import React from "react";
import "../css/statCard.css";

type StatCardProps = {
  name: string;
  value: number | string;
};

const StatCard: React.FC<StatCardProps> = ({ name, value }) => {
  return (
    <div className="stat-card">
      <p className="stat-name">{name}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
};

export default StatCard;
