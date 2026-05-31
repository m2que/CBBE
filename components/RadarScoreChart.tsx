
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
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                    </linearGradient>
                </defs>
                <PolarGrid stroke="#4A5568" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar 
                  name={data.brandName} 
                  dataKey="score" 
                  stroke="#8884d8" 
                  fill="url(#colorUv)" 
                  fillOpacity={0.6}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1A202C',
                        borderColor: '#4A5568',
                        color: '#E2E8F0',
                    }}
                    itemStyle={{ color: '#E2E8F0' }}
                    labelStyle={{ color: '#A0AEC0' }}
                />
                <Legend wrapperStyle={{color: '#E2E8F0'}}/>
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default RadarScoreChart;
