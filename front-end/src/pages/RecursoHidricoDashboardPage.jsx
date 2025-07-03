// src/pages/RecursoHidricoDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Drop, Radio, CaretRight } from '@phosphor-icons/react';

const DeviceCard = ({ device }) => (
    <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        <div>
            <h5 className="mb-1 d-flex align-items-center"><Radio size={20} className={`me-2 ${device.status ? 'text-success' : 'text-danger'}`} />{device.nome_dispositivo}</h5>
            <small className="text-muted">{device.mac_address}</small>
        </div>
        <Link to={`/dispositivos/${device.mac_address}`} className="btn btn-sm btn-outline-primary">
            Ver Gráficos <CaretRight size={16} />
        </Link>
    </div>
);

const RecursoHidricoDashboardPage = () => {
    const { recursoId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [recurso, setRecurso] = useState(null);
    const [dispositivos, setDispositivos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
        const fetchRecursoDetails = api.get(`/recursos-hidricos/${recursoId}/`);
        
        const search = searchParams.get('search');
        const params = new URLSearchParams();
        params.set('local', recursoId);
        if (search) {
            params.set('search', search);
        }
        const fetchDispositivos = api.get(`/dispositivos/?${params.toString()}`);

        Promise.all([fetchRecursoDetails, fetchDispositivos])
            .then(([recursoRes, dispositivosRes]) => {
                setRecurso(recursoRes.data);
                setDispositivos(dispositivosRes.data);
            })
            .catch(error => {
                console.error("Erro ao buscar dados do recurso hídrico:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [recursoId, searchParams]);

    if (loading) return <div className="text-center">Carregando...</div>;
    if (!recurso) return <div className="text-center">Recurso Hídrico não encontrado.</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3">Dashboard do Recurso Hídrico</h1>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">Voltar</button>
            </div>
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className="d-flex align-items-center"><Drop size={24} className="me-2" /> Informações do Recurso</h5>
                <p className="mb-0"><strong>Nome:</strong> {recurso.nome}</p>
                <p className="mb-0"><strong>ID:</strong> {recurso.id}</p>
            </div>

            <div className="card p-3 shadow-sm">
                <h5>Dispositivos Sensores Associados</h5>
                {dispositivos.length > 0 ? (
                    <div className="list-group">
                        {dispositivos.map(device => <DeviceCard key={device.mac_address} device={device} />)}
                    </div>
                ) : (
                    <p className="text-muted">Nenhum dispositivo sensor cadastrado neste recurso ou encontrado na busca.</p>
                )}
            </div>
        </div>
    );
};

export default RecursoHidricoDashboardPage;