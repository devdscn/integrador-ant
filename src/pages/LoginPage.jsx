// src/pages/LoginPage.jsx (Corrigido para usar o Hook)

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Space } from 'antd';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
// 1. Importa o hook customizado
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // 2. Chama o hook para obter a API de notificação
    const notificationApi = useNotificationAPI();

    // Função de submissão do formulário
    const onFinish = async (values) => {
        setIsLoading(true);
        const { email, password } = values;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // 3. Usa o hook para exibir a mensagem de erro do Supabase
                notificationApi.error({
                    message: 'Erro de Autenticação',
                    description: error.message,
                });
            } else if (data.session) {
                notificationApi.success({
                    message: 'Login bem-sucedido!',
                    description: 'Seja bem vindo!',
                    duration: 1.5,
                    placement: 'bottomRight',
                });

                navigate('/', { replace: true });
            }
        } catch (error) {
            // Usa o hook para erros de rede
            notificationApi.error({
                message: 'Erro Inesperado',
                description:
                    'Não foi possível conectar ao servidor. Verifique sua conexão.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Row
            justify="center"
            align="middle"
            style={{ minHeight: '100vh', padding: 24 }}
        >
            <Col xs={24} sm={18} md={10} lg={8} xl={6}>
                <Card bordered={false}>
                    <Space
                        direction="vertical"
                        style={{ width: '100%', textAlign: 'center' }}
                    >
                        <Title level={2}>Integrador MDE</Title>
                        <Title level={5} type="secondary">
                            Acesse sua conta
                        </Title>
                    </Space>

                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        style={{ marginTop: 20 }}
                    >
                        {/* Itens do formulário */}
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira seu e-mail!',
                                },
                                { type: 'email', message: 'E-mail inválido!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="E-mail"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira sua senha!',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Senha"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%', height: 40 }}
                                loading={isLoading}
                                icon={isLoading ? <LoadingOutlined /> : null}
                            >
                                Entrar
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;
