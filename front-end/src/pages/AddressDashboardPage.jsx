// src/pages/AddressDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Drop, CaretRight } from '@phosphor-icons/react';

const RecursoCard = ({ recurso }) => (
    <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        <div>
            <h5 className="mb-1 d-flex align-items-center"><Drop size={20} className="me-2 text-info" />{recurso.nome}</h5>
            <small>ID: {recurso.id}</small>
        </div>
        <Link to={`/recursos/${recurso.id}`} className="btn btn-sm btn-outline-primary">
            Detalhes <CaretRight size={16} />
        </Link>
    </div>
);

const AddressDashboardPage = () => {
    const { enderecoId } = useParams();
    const [address, setAddress] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Adicionado console.log para depuração
        console.log("Tentando buscar detalhes para o Endereço ID:", enderecoId);

        const fetchAddressDetails = api.get(`/addresses/${enderecoId}/`);
        const fetchRecursos = api.get(`/recursos-hidricos/?endereco=${enderecoId}`);

        Promise.all([fetchAddressDetails, fetchRecursos])
            .then(([addressRes, recursosRes]) => {
                // Adicionado console.log para depuração
                console.log("Dados do endereço recebidos:", addressRes.data);
                console.log("Dados dos recursos recebidos:", recursosRes.data);

                setAddress(addressRes.data);
                setRecursos(recursosRes.data);
            })
            .catch(error => {
                console.error("Erro ao buscar dados do endereço:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [enderecoId]);

    if (loading) return <div className="text-center">Carregando...</div>;
    if (!address) return <div className="text-center p-5 bg-light rounded"><h4>Endereço não encontrado.</h4><p>Verifique se o endereço existe ou se você tem permissão para visualizá-lo.</p></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3">Dashboard do Local</h1>
                <Link to="/dashboard" className="btn btn-sm btn-outline-secondary">Voltar</Link>
            </div>
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className="d-flex align-items-center"><MapPin size={24} className="me-2" /> Informações do Endereço</h5>
                <p className="mb-0">{`${address.rua}, ${address.numero}`}</p>
                <p className="mb-0">{`${address.bairro}, ${address.municipio} - ${address.estado}`}</p>
            </div>

            <div className="card p-3 shadow-sm">
                <h5>Recursos Hídricos Associados</h5>
                {recursos.length > 0 ? (
                    <div className="list-group">
                        {recursos.map(recurso => <RecursoCard key={recurso.id} recurso={recurso} />)}
                    </div>
                ) : (
                    <p className="text-muted">Nenhum recurso hídrico cadastrado neste local.</p>
                )}
            </div>
        </div>
    );
};

export default AddressDashboardPage;