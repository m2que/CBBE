
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CBBEData, ScenarioEvaluation, UserPrediction } from '../types';

interface RadarScoreChartProps {
    data: CBBEData;
    userPrediction?: UserPrediction;
    scenarioEvaluation?: ScenarioEvaluation;
}

const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ data, userPrediction, scenarioEvaluation }) => {
    const chartData = [
        {
          subject: 'Salience',
          baseline: data.salience.score,
          userPrediction: typeof userPrediction?.dimensions.salience.predictedScore === 'number' ? userPrediction.dimensions.salience.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.salience.score,
          fullMark: 100
        },
        {
          subject: 'Performance',
          baseline: data.performance.score,
          userPrediction: typeof userPrediction?.dimensions.performance.predictedScore === 'number' ? userPrediction.dimensions.performance.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.performance.score,
          fullMark: 100
        },
        {
          subject: 'Imagery',
          baseline: data.imagery.score,
          userPrediction: typeof userPrediction?.dimensions.imagery.predictedScore === 'number' ? userPrediction.dimensions.imagery.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.imagery.score,
          fullMark: 100
        },
        {
          subject: 'Judgements',
          baseline: data.judgements.score,
          userPrediction: typeof userPrediction?.dimensions.judgements.predictedScore === 'number' ? userPrediction.dimensions.judgements.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.judgements.score,
          fullMark: 100
        },
        {
          subject: 'Feelings',
          baseline: data.feelings.score,
          userPrediction: typeof userPrediction?.dimensions.feelings.predictedScore === 'number' ? userPrediction.dimensions.feelings.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.feelings.score,
          fullMark: 100
        },
        {
          subject: 'Resonance',
          baseline: data.resonance.score,
          userPrediction: typeof userPrediction?.dimensions.resonance.predictedScore === 'number' ? userPrediction.dimensions.resonance.predictedScore : undefined,
          aiEstimate: scenarioEvaluation?.dimensions.resonance.score,
          fullMark: 100
        },
    ];

    const showScenarioSeries = Boolean(userPrediction || scenarioEvaluation);

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
                  dataKey="baseline" 
                  stroke="#4f46e5" 
                  fill="url(#colorUv)" 
                  fillOpacity={1}
                />
                {showScenarioSeries && (
                  <Radar
                    name="Your prediction"
                    dataKey="userPrediction"
                    stroke="#0d9488"
                    fill="none"
                    strokeDasharray="6 4"
                  />
                )}
                {scenarioEvaluation && (
                  <Radar
                    name="AI estimate"
                    dataKey="aiEstimate"
                    stroke="#f59e0b"
                    fill="none"
                  />
                )}
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
