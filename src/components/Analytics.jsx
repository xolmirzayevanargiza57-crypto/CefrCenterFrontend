import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

export default function Analytics({ progress, scores }) {
  const timestamps = progress?._scoreTimestamps || {};
  
  // Prepare data for line chart
  const lineData = Object.entries(timestamps)
    .map(([key, data]) => ({
      date: data.date,
      score: data.score || data.xp || 0,
      skill: key.split('_')[0].charAt(0).toUpperCase() + key.split('_')[0].slice(1)
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Prepare data for radar chart (latest scores per skill)
  const skills = ['Listening', 'Reading', 'Writing', 'Speaking'];
  const radarData = skills.map(skill => {
    const keyPrefix = skill.toLowerCase();
    const relevantScores = Object.entries(scores || {})
      .filter(([k]) => k.startsWith(keyPrefix))
      .map(([, v]) => v);
    const maxScore = relevantScores.length > 0 ? Math.max(...relevantScores) : 0;
    return { subject: skill, A: maxScore, fullMark: 100 };
  });

  if (lineData.length === 0) return (
    <div style={{ padding: 30, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ color: '#8b9bbf' }}>Complete more tests to see your progress analytics.</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
      {/* SCORE TREND */}
      <div style={{ background: '#18243a', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Score Trend</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#4a5568" fontSize={11} tickMargin={10} />
              <YAxis stroke="#4a5568" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                itemStyle={{ fontSize: 12, fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SKILL BALANCE */}
      <div style={{ background: '#18243a', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Skill Balance</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b9bbf', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="none" />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#EF9F27"
                fill="#EF9F27"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 11, color: '#4a5568', textAlign: 'center', marginTop: 10 }}>Mapping your proficiency across all CEFR domains.</p>
      </div>
    </div>
  );
}
