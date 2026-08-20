
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
                        <stop offset="5%" stopColor="#1f4b8f" stopOpacity={0.34}/>
                        <stop offset="95%" stopColor="#1f4b8f" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(95, 107, 122, 0.24)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5f6b7a', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar 
                  name={data.brandName} 
                  dataKey="score" 
                  stroke="#1f4b8f" 
                  fill="url(#colorUv)" 
                  fillOpacity={1}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fffaf2',
                        borderColor: '#d6d2cb',
                        color: '#1d2430',
                    }}
                    itemStyle={{ color: '#1d2430' }}
                    labelStyle={{ color: '#5f6b7a' }}
                />
                <Legend wrapperStyle={{color: '#5f6b7a'}}/>
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default RadarScoreChart;
