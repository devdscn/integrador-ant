// src/pages/LoginPage.jsx (Simplificado)

import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    Space,
    notification,
} from 'antd';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { supabase } from '../services/supabase';

const { Title } = Typography;

const LoginPage = () => {
    // const { login } = useAuth(); // Removido
    // const navigate = useNavigate(); // Removido
    const [isLoading, setIsLoading] = useState(false);

    // Função de submissão do formulário
    const onFinish = async (values) => {
        setIsLoading(true);
        const { email, password } = values;

        try {
            // 1. Chamada de autenticação com o Supabase
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Notificação de erro do Supabase
                notification.error({
                    message: 'Erro de Login',
                    description: error.message,
                });
            } else {
                // 2. SUCESSO!
                // NÃO É NECESSÁRIO CHAMAR login() ou navigate('/') AQUI.
                // O AuthProvider detecta o sucesso via onAuthStateChange e o ProtectedRoute redireciona.
                notification.success({
                    message: 'Login bem-sucedido!',
                    description: 'Redirecionando para o Dashboard...',
                    duration: 1.5,
                });
            }
        } catch (error) {
            // Erro de rede ou outro erro inesperado
            notification.error({
                message: 'Erro Inesperado',
                description:
                    'Não foi possível conectar ao servidor de autenticação.',
            });
        } finally {
            // Garante que o botão volte ao normal, mesmo em caso de sucesso
            // O redirecionamento ocorrerá logo em seguida.
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
                        {/* Itens do formulário (E-mail e Senha) permanecem os mesmos */}
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
