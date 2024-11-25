import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function GoalChart ({ goalsConceded, goalsScored }){
    const { t } = useTranslation();
    const [goalsScoredTxt] = useState(t('viewProfile.goalScore'));
    const [goalsConcededTxt] = useState(t('viewProfile.goalConceded'));

    const data = {
        labels: [goalsScoredTxt, goalsConcededTxt],
        datasets: [
            {
                label: 'Goals',
                data: [goalsScored, goalsConceded],
                backgroundColor: ['#B8F2E6', '#FFA69E'],
                borderColor: ['#161719', '#161719'],
                borderWidth: 2,
                barThickness: 80,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Millimetre-Light',
                        size: 10,
                        weight: 'bold',
                        color: '#000000',
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Millimetre-Light',
                        size: 10,
                        weight: 'bold',
                        color: '#000000',
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                titleFont: {
                    family: 'Millimetre-Light',
                    size: 10,
                    weight: 'bold',
                    color: '#000000',
                },
                bodyFont: {
                    family: 'Millimetre-Light',
                    size: 10,
                    weight: 'bold',
                    color: '#000000',
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default GoalChart;
