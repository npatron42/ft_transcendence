import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './ViewProfile.css';

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
    const { wins, losses, winPercentage, lossPercentage } = calculateWinLossRatio(matchHistory);

    const data = {
        labels: ['Victoire', 'Défaite'],
        datasets: [
            {
                data: [wins, losses],
                backgroundColor: ['#B8F2E6', '#FFA69E'],
                hoverBackgroundColor: ['#A0D3E5', '#E67B7B'],
                cutout: '70%',
            }
        ]
    };

    const options = {
        plugins: {
            legend: {
                display: true,
            },
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const total = wins + losses;
                    const percentage = total ? (value / total * 100).toFixed(0) : 0;
                    return `${percentage}%`;
                }
            }
        }
    };

    return (
        <div>
            <h3>Ratio Victoires/Défaites</h3>
            <Pie data={data} options={options} className="win-loss-chart" />
        </div>
    );
}

export default WinLossChart;
