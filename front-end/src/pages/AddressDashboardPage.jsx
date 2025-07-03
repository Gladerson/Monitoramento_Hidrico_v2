// src/pages/AddressDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { MapPin, ArrowLeft, PlusCircle } from '@phosphor-icons/react';

const RecursoHidricoCard = ({ recurso }) => (
    <div className="col">
        <div className="card shadow-sm h-100">
            <div className="card-body">
                <h5 className="card-title">{recurso.nome}</h5>
                <p className="card-text text-muted">Tipo: {recurso.tipo.replace("_", " ")}</p>
                <Link to={`/recursos/${recurso.id}`} className="btn btn-sm btn-outline-primary">
                    Ver Dispositivos
                </Link>
            </div>
        </div>
    </div>
);

const AddressDashboardPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [address, setAddress] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAddressDetails = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Busca os detalhes do endereço
                const addressResponse = await api.get(`/addresses/${id}/`);
                setAddress(addressResponse.data);

                // 2. Busca os recursos hídricos com base no endereço e no termo de pesquisa
                const search = searchParams.get('search');
                const params = new URLSearchParams();
                params.set('endereco', id);
                if (search) {
                    params.set('search', search);
                }

                const recursosResponse = await api.get(`/recursos-hidricos/?${params.toString()}`);
                setRecursos(recursosResponse.data);

            } catch (err) {
                console.error("Erro ao buscar detalhes do endereço:", err);
                setError('Endereço não encontrado. Verifique se o endereço existe ou se você tem permissão para visualizá-lo.');
            } finally {
                setLoading(false);
            }
        };

        fetchAddressDetails();
    }, [id, searchParams]);

    if (loading) {
        return <div className="text-center">Carregando detalhes do endereço...</div>;
    }

    if (error) {
        return (
            <div className="text-center alert alert-danger">
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-3">
                    <ArrowLeft size={16} className="me-2" />
                    Voltar para o Início
                </button>
            </div>
        );
    }

    if (!address) {
        return <div className="text-center">Nenhum dado de endereço para exibir.</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h2 d-flex align-items-center">
                        <MapPin size={32} className="me-3" />
                        Detalhes do Endereço
                    </h1>
                    <p className="text-muted">
                        {`${address.rua}, ${address.numero}, ${address.bairro}, ${address.municipio} - ${address.estado}`}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-outline-secondary">
                    <ArrowLeft size={16} className="me-2" />
                    Voltar
                </button>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center my-4">
                <h2 className="h4">Recursos Hídricos</h2>
                <button className="btn btn-sm btn-primary">
                    <PlusCircle size={20} className="me-2" />
                    Adicionar Recurso
                </button>
            </div>

            {recursos.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {recursos.map(recurso => (
                        <RecursoHidricoCard key={recurso.id} recurso={recurso} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-5 bg-light rounded">
                    <p>Nenhum recurso hídrico encontrado para este endereço ou filtro.</p>
                </div>
            )}
        </div>
    );
};

export default AddressDashboardPage;