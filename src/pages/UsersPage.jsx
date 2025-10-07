/* eslint-disable no-unused-vars */
// src/pages/UsersPage.jsx

import React from 'react';
import { Layout, Typography, Table, Tag, Space, Spin, Alert, Card } from 'antd';
import { useUsers } from '../hooks/useUsers';
import AppLayout from '../components/Layout/AppLayout';

const { Title } = Typography;

// Função auxiliar para mapear cores do Role
const getRoleColor = (role) => {
    switch (role) {
        case 'admin':
            return 'red';
        case 'moderator':
            return 'blue';
        case 'user':
        default:
            return 'green';
    }
};

const UsersPage = () => {
    const { data: users, isLoading, isError, error } = useUsers();

    // 1. Definição das Colunas da Tabela
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (text) => text.substring(0, 4) + '...', // Exibe os primeiros 4 caracteres do UUID
        },
        {
            title: 'Nome / Apelido',
            key: 'name',
            // Renderiza nome ou apelido (priorizando o nome completo se existir)
            render: (_, record) => <span>{record.nome || record.apelido}</span>,
            sorter: (a, b) =>
                (a.nome || a.apelido).localeCompare(b.nome || b.apelido),
            // Habilita a busca por nome/apelido na coluna
            onFilter: (value, record) =>
                (record.nome || record.apelido)
                    .toLowerCase()
                    .includes(value.toLowerCase()),
            filterMode: 'tree',
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            responsive: ['md'], // Oculta em telas menores que 'md'
        },
        {
            title: 'Telefone',
            dataIndex: 'telefone',
            key: 'telefone',
            responsive: ['md'],
            width: 150,
        },
        {
            title: 'Nível',
            dataIndex: 'role',
            key: 'role',
            // 2. Renderiza o Role com Tag colorida
            render: (role) => (
                <Tag color={getRoleColor(role)} key={role}>
                    {role ? role.toUpperCase() : 'N/A'}
                </Tag>
            ),
            sorter: (a, b) => a.role.localeCompare(b.role),
            // Filtro rápido por tipo de role
            filters: [
                { text: 'ADMIN', value: 'admin' },
                { text: 'MODERATOR', value: 'moderator' },
                { text: 'USER', value: 'user' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Criação',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            responsive: ['lg'],
            // 3. Formata a data
            render: (date) => new Date(date).toLocaleDateString('pt-BR'),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: 'Ações',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <a>Editar</a>
                </Space>
            ),
        },
    ];

    // ====================================================================
    // 4. Renderização com Estados
    // ====================================================================
    // if (isLoading) {
    //     return (
    //         <Spin
    //             tip="Carregando lista de usuários..."
    //             size="large"
    //             style={{
    //                 display: 'block',
    //                 margin: '50px 0',
    //                 textAlign: 'center',
    //             }}
    //         />
    //     );
    // }
    if (isLoading) {
        // Usa um contêiner flex para centralizar perfeitamente
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center', // Centraliza horizontalmente
                    alignItems: 'center', // Centraliza verticalmente
                    minHeight: '80vh', // Garante que ocupe a altura da área de conteúdo
                }}
            >
                <Spin
                    tip="Carregando lista de usuários..."
                    size="large" // Define o tamanho como GRANDE
                />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                message="Erro ao Carregar Dados"
                description={`Não foi possível buscar a lista de usuários. Detalhes: ${error.message}`}
                type="error"
                showIcon
            />
        );
    }

    // A página de Listagem de Usuários (sem o AppLayout interno, pois é rota filha)
    return (
        <>
            <Title level={2}>Listagem de Usuários</Title>
            <Card style={{ marginTop: 20 }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }} // Habilita o scroll horizontal em telas menores
                    bordered
                />
            </Card>
        </>
    );
};

// O componente de LayoutWrapper (LayoutRoute) garante que o AppLayout seja injetado
export default UsersPage;
