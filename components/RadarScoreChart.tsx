
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CBBEData } from '../types';

interface RadarScoreChartProps {
    data: CBBEData;
}

const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ data }) => {
    const chartData = [
        { subject: 'Salience', score: data.salience.score, fullMark: 100 },
        { subject: 'Performance', score: data.performance.score, fullMark: 100 },
        { subject: 'Imagery', score: data.imagery.score, fullMark: 100 },
        { subject: 'Judgements', score: data.judgements.score, fullMark: 100 },
        { subject: 'Feelings', score: data.feelings.score, fullMark: 100 },
        { subject: 'Resonance', score: data.resonance.score, fullMark: 100 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.34}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(71, 85, 105, 0.24)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar 
                  name={data.brandName} 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  fill="url(#colorUv)" 
                  fillOpacity={1}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#c7d2fe',
                        color: '#0f172a',
                        borderRadius: '12px',
                    }}
                    itemStyle={{ color: '#0f172a' }}
                    labelStyle={{ color: '#475569' }}
                />
                <Legend wrapperStyle={{ color: '#475569', fontFamily: 'Inter, system-ui, sans-serif' }}/>
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default RadarScoreChart;
