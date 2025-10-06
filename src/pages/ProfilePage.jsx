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
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title } = Typography;
const { Content } = Layout;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const { data: profile, isLoading, isError, error } = useProfile();
    const { mutate, isPending: isSaving } = useUpdateProfile();
    const notificationApi = useNotificationAPI();

    // 1. Efeito para carregar os dados no formulário assim que a query terminar
    useEffect(() => {
        if (profile) {
            form.setFieldsValue(profile);
        }
    }, [profile, form]);

    // 2. Função de submissão do formulário
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

    // 3. Estado de Carregamento
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

    // 4. Estado de Erro
    if (isError) {
        return (
            <Title level={3} type="danger">
                Erro ao carregar o perfil: {error.message}
            </Title>
        );
    }

    // 5. Renderização do Formulário
    return (
        <Content style={{ padding: 24, margin: 0 }}>
            <Title level={2}>Meu Perfil</Title>
            <Card title="Informações Pessoais">
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={profile} // Usado se houver dados iniciais
                >
                    {/* Grid Responsivo: Usa Col para dividir os campos em telas maiores */}
                    <Row gutter={24}>
                        {/* Nome e Apelido */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="nome"
                                label="Nome Completo"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="apelido"
                                label="Apelido/Nome de Usuário"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        {/* Telefone e CPF */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="telefone"
                                label="Telefone"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="cpf" label="CPF">
                                <Input disabled={!!profile?.cpf} />{' '}
                                {/* Desabilita se já houver CPF */}
                            </Form.Item>
                        </Col>

                        {/* ENDEREÇO - Linha 3 */}
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
            {/* Opcional: Mostrar o role (apenas leitura) */}
            <Typography.Text
                type="secondary"
                style={{ display: 'block', marginTop: 16 }}
            >
                Seu Nível de Acesso: {profile?.role}
            </Typography.Text>
        </Content>
    );
};

export default ProfilePage;
