// src/pages/AddressListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, CaretRight } from '@phosphor-icons/react';

const AddressCard = ({ address }) => (
    <div className="col">
        <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
                <h5 className="card-title d-flex align-items-center">
                    <MapPin size={24} className="me-2 text-primary" />
                    Endereço Principal
                </h5>
                <p className="card-text text-muted flex-grow-1">{`${address.rua}, ${address.numero}, ${address.bairro}, ${address.municipio} - ${address.estado}`}</p>
                <div className="d-flex justify-content-end align-items-center">
                    <Link to={`/enderecos/${address.id}`} className="btn btn-sm btn-primary">
                        Ver Detalhes <CaretRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

const AddressListPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchAddresses = () => {
            setLoading(true);
            const params = new URLSearchParams(searchParams);
            const tipo = params.get('tipo');

            // O backend espera 'recursos_hidricos__tipo' para o filtro de tipo.
            if (tipo) {
                params.delete('tipo');
                params.set('recursos_hidricos__tipo', tipo);
            }
            
            const url = `/addresses/?${params.toString()}`;

            api.get(url)
                .then(response => {
                    setAddresses(response.data);
                })
                .catch(error => {
                    console.error("Erro ao buscar endereços:", error);
                    setAddresses([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        fetchAddresses();
    }, [searchParams]);

    if (loading) {
        return <div className="text-center">Carregando locais de monitoramento...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Locais de Monitoramento</h1>
                {user?.role !== 'USER' && (
                     <button className="btn btn-primary">Adicionar Local</button>
                )}
            </div>
            
            {addresses.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {addresses.map(address => (
                        <AddressCard key={address.id} address={address} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-5 bg-light rounded">
                    <p>Nenhum local de monitoramento encontrado para este usuário ou filtro.</p>
                </div>
            )}
        </div>
    );
};

export default AddressListPage;