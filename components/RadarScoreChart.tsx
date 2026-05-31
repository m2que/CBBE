
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
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.78}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.24}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(113, 86, 56, 0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar 
                  name={data.brandName} 
                  dataKey="score" 
                  stroke="#0f766e" 
                  fill="url(#colorUv)" 
                  fillOpacity={0.6}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fffaf2',
                        borderColor: 'rgba(113, 86, 56, 0.2)',
                        color: '#1f2937',
                    }}
                    itemStyle={{ color: '#1f2937' }}
                    labelStyle={{ color: '#475569' }}
                />
                <Legend wrapperStyle={{color: '#334155'}}/>
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default RadarScoreChart;
