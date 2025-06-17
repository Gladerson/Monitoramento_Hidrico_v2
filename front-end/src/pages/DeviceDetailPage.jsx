// src/pages/DeviceDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const MESES = [
    { nome: 'Janeiro', num: 1 }, { nome: 'Fevereiro', num: 2 }, { nome: 'Março', num: 3 },
    { nome: 'Abril', num: 4 }, { nome: 'Maio', num: 5 }, { nome: 'Junho', num: 6 },
    { nome: 'Julho', num: 7 }, { nome: 'Agosto', num: 8 }, { nome: 'Setembro', num: 9 },
    { nome: 'Outubro', num: 10 }, { nome: 'Novembro', num: 11 }, { nome: 'Dezembro', num: 12 }
];

const DeviceDetailPage = () => {
    const { mac } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [stats, setStats] = useState({ monthly_consumption: [], daily_max_flow: [] });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear] = useState(new Date().getFullYear());

    const fetchDetails = useCallback(() => {
        api.get(`/dispositivos/${mac}/`)
            .then(response => setDevice(response.data))
            .catch(error => console.error("Erro ao buscar detalhes do dispositivo:", error));
    }, [mac]);

    const fetchStats = useCallback(() => {
        setLoading(true);
        api.get(`/dispositivos/${mac}/stats/?year=${selectedYear}&month=${selectedMonth}`)
            .then(response => {
                setStats(response.data);
            })
            .catch(error => console.error("Erro ao buscar estatísticas:", error))
            .finally(() => setLoading(false));
    }, [mac, selectedYear, selectedMonth]);

    useEffect(() => {
        fetchDetails();
        const intervalId = setInterval(fetchDetails, 5000);
        return () => clearInterval(intervalId);
    }, [fetchDetails]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (!device) return <div className="text-center p-5">Carregando...</div>;

    const doughnutData = {
        labels: stats.monthly_consumption.map(item => MESES.find(m => new Date(item.month).getMonth() + 1 === m.num)?.nome),
        datasets: [{
            label: 'Consumo Mensal (L)',
            data: stats.monthly_consumption.map(item => item.total_vazao),
            backgroundColor: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#6a040f', '#0077b6', '#00b4d8', '#ffb703', '#fb8500', '#7209b7', '#3f37c9'],
        }]
    };
    
    const lineData = {
        labels: stats.daily_max_flow.map(item => new Date(item.day).getDate()),
        datasets: [{
            label: `Vazão Máxima (L/min) em ${MESES.find(m => m.num === selectedMonth)?.nome}`,
            data: stats.daily_max_flow.map(item => item.max_vazao),
            fill: true,
            backgroundColor: 'rgba(13, 110, 253, 0.2)',
            borderColor: 'rgba(13, 110, 253, 1)',
            tension: 0.3
        }]
    };
    
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <h3>{device.nome_dispositivo}</h3>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">Voltar</button>
            </div>
            <hr/>
            <div className="card p-3 mb-4">
                <div className="row">
                    <div className="col-md-6">
                        <p className="mb-1"><strong>MAC Address:</strong> {device.mac_address}</p>
                        <p className="mb-1"><strong>Tipo:</strong> {device.tipo}</p>
                        <p className="mb-1"><strong>Última Atualização:</strong> {new Date(device.ultima_atualizacao).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="col-md-6">
                        <p className="mb-1"><strong>Vazão Atual:</strong> {device.metrica_01.toFixed(2)} L/min</p>
                        <p className="mb-1"><strong>Volume (Leitura):</strong> {device.metrica_02.toFixed(2)} L</p>
                        <p className="mb-1"><strong>Status:</strong> <span className={device.status ? 'text-success' : 'text-danger'}>{device.status ? 'Online' : 'Offline'}</span></p>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card p-3 h-100">
                         <h5>Consumo no Ano ({selectedYear})</h5>
                         <div style={{ position: 'relative', height: '300px' }}>
                            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                         </div>
                    </div>
                </div>
                <div className="col-lg-7 mb-4">
                    <div className="card p-3 h-100">
                        <h5>Registro de Vazões Diárias</h5>
                        <div className="btn-toolbar" role="toolbar">
                            <div className="btn-group flex-wrap">
                                {MESES.map(mes => (
                                    <button 
                                        key={mes.num} 
                                        className={`btn btn-sm m-1 ${selectedMonth === mes.num ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setSelectedMonth(mes.num)}
                                    >
                                        {mes.nome.substring(0,3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ position: 'relative', height: '250px', marginTop: '1rem' }}>
                           {loading ? <p>Carregando gráfico...</p> : <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetailPage;