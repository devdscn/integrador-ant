// src/pages/LoginPage.jsx (Corrigido)

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
import { useNavigate } from 'react-router-dom'; // <--- Reintroduzido para redirecionamento imediato

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate(); // Hook de navegação
    const [isLoading, setIsLoading] = useState(false);

    // Função de submissão do formulário
    const onFinish = async (values) => {
        setIsLoading(true);
        const { email, password } = values;

        try {
            // 1. Chamada de autenticação com o Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // 2. TRATAMENTO DE ERRO: Exibir a mensagem de erro do Supabase
                notification.error({
                    message: 'Erro de Autenticação',
                    description: error.message, // Exibe a mensagem de erro (ex: Invalid login credentials)
                });
            } else if (data.session) {
                // 3. SUCESSO E REDIRECIONAMENTO: Se a sessão for estabelecida
                notification.success({
                    message: 'Login bem-sucedido!',
                    description: 'Você está sendo redirecionado.',
                    duration: 1.5,
                });

                // Redirecionamento imediato para o Dashboard
                navigate('/', { replace: true });
            }
        } catch (error) {
            // Erro de rede ou outro erro inesperado
            notification.error({
                message: 'Erro Inesperado',
                description:
                    'Não foi possível conectar ao servidor. Verifique sua conexão.',
            });
        } finally {
            // O loading deve ser desativado após o Supabase retornar a resposta
            // Se for sucesso, o navigate acontece, se for erro, o botão destrava.
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
