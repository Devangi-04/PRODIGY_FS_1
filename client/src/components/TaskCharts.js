import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const TaskCharts = ({ stats }) => {
    const statusData = {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [
            {
                data: [stats.pending, stats['in-progress'], stats.completed],
                backgroundColor: ['#e67e22', '#3498db', '#27ae60'],
                borderColor: ['#d35400', '#2980b9', '#27ae60'],
                borderWidth: 1,
            },
        ],
    };

    const priorityData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [
            {
                label: 'Tasks by Priority',
                data: [
                    stats.priority?.high || 0,
                    stats.priority?.medium || 0,
                    stats.priority?.low || 0
                ],
                backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    return (
        <div className="charts-container">
            <div className="chart-wrapper">
                <h3>Task Status Distribution</h3>
                <div className="chart">
                    <Doughnut data={statusData} options={options} />
                </div>
            </div>
            <div className="chart-wrapper">
                <h3>Tasks by Priority</h3>
                <div className="chart">
                    <Bar data={priorityData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default TaskCharts;