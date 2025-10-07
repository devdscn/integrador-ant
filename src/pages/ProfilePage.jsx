// src/pages/ProfilePage.jsx

import React, { useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Row,
    Col,
    Layout,
    Spin,
} from 'antd';
// import AppLayout is REMOVED
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title } = Typography;
const { Content } = Layout; // Mantido para uso nos estados de loading/erro

const ProfilePage = () => {
    const [form] = Form.useForm();
    // Hooks do React Query para buscar e atualizar o perfil
    const { data: profile, isLoading, isError, error } = useProfile();
    const { mutate, isPending: isSaving } = useUpdateProfile();
    const notificationApi = useNotificationAPI();

    // Sincroniza os dados do perfil com o formulário quando a query retorna
    useEffect(() => {
        if (profile) {
            form.setFieldsValue(profile);
        }
    }, [profile, form]);

    // Função de submissão do formulário (chama a mutação)
    const onFinish = (values) => {
        mutate(values, {
            onSuccess: () => {
                notificationApi.success({
                    message: 'Sucesso!',
                    description: 'Seu perfil foi atualizado com sucesso.',
                });
            },
            onError: (err) => {
                notificationApi.error({
                    message: 'Erro ao Salvar',
                    description:
                        err.message || 'Não foi possível atualizar o perfil.',
                });
            },
        });
    };

    // ====================================================================
    // 1. Estados de Loading/Erro (Renderização sem o Layout completo)
    // Isso garante que o usuário veja o status mesmo que o LayoutRoute ainda não tenha carregado
    // ====================================================================
    if (isLoading) {
        return (
            <Layout
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Content>
                    <Spin size="large" tip="Carregando dados do perfil..." />
                </Content>
            </Layout>
        );
    }

    if (isError) {
        return (
            <Title
                level={3}
                type="danger"
                style={{ textAlign: 'center', marginTop: 50 }}
            >
                Erro ao carregar o perfil: {error.message}
            </Title>
        );
    }

    // ====================================================================
    // 2. Conteúdo da Página (Injetado no AppLayout via <Outlet />)
    // ====================================================================
    return (
        <>
            <Title level={2}>Meu Perfil</Title>
            <Card title="Informações Pessoais">
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={profile}
                >
                    <Row gutter={24}>
                        {/* Nome e Apelido */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="nome"
                                label="Nome Completo"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nome é obrigatório',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="apelido"
                                label="Apelido/Nome de Usuário"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Apelido é obrigatório',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        {/* Telefone e CPF */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="telefone"
                                label="Telefone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Telefone é obrigatório',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="cpf" label="CPF">
                                {/* O CPF fica desabilitado se já estiver preenchido, seguindo a lógica de dados */}
                                <Input disabled={!!profile?.cpf} />
                            </Form.Item>
                        </Col>

                        {/* ENDEREÇO */}
                        <Col xs={24} md={18}>
                            <Form.Item name="endereco" label="Endereço">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="numero" label="Número">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSaving}
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Typography.Text
                type="secondary"
                style={{ display: 'block', marginTop: 16 }}
            >
                Seu Nível de Acesso: {profile?.role}
            </Typography.Text>
        </>
    );
};

export default ProfilePage;
