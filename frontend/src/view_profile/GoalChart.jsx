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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GoalChart = ({ goalsConceded, goalsScored }) => {
    const data = {
        labels: ['Goals Scored', 'Goals Conceded'],
        datasets: [
            {
                label: 'Goals',
                data: [goalsScored, goalsConceded],
                backgroundColor: ['#B3E6E3', '#FFA69E'],
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
                enabled: true, // Active les infobulles
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
