import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './viewProfile.css';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const calculateWinLossRatio = (matchHistory) => {
    const wins = matchHistory.filter(match => match.win).length;
    const losses = matchHistory.filter(match => !match.win).length;
    const total = wins + losses;

    return {
        wins,
        losses,
        winPercentage: total ? (wins / total * 100).toFixed(2) : 0,
        lossPercentage: total ? (losses / total * 100).toFixed(2) : 0
    };
};

function WinLossChart({ matchHistory }) {
    const { wins, losses } = calculateWinLossRatio(matchHistory);
    const { t } = useTranslation();
    const [textPercent] = useState(t('viewProfile.percent'));

    const data = {
        datasets: [
            {
                data: [wins, losses],
                backgroundColor: ['#B8F2E6', '#FFA69E'],
                borderColor: ['#161719', '#161719'],
                borderWidth: 2,
                cutout: '70%',
            }
        ]
    };

    const options = {
        hover: {
            mode: null
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: textPercent,
                font: {
                    family: 'Millimetre-Light',
                    size: 16,
                    weight: 'bold',
                    color: '#000000',
                },
                padding: {
                    bottom: 10,
                }
            },
            datalabels: {
                color: '#000000',
                font: {
                    family: 'Millimetre-Light', 
                    size: 10,
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    const total = wins + losses;
                    const percentage = total ? (value / total * 100).toFixed(0) : 0;
                    return `${percentage}%`;
                }
            }
        }
    };

    return (
        <Pie data={data} options={options} className="win-loss-chart" />
    );
}

export default WinLossChart;
