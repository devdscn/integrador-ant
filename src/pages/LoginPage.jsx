import React, { useState } from 'react';
// ADICIONADO: Link para navegação
import { Form, Input, Button, Card, Typography, Row, Col, Space } from 'antd';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
// IMPORT ATUALIZADO: Inclui Link para navegação para a página de cadastro
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
// Importação do hook customizado para exibir notificações
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title, Text } = Typography; // DESESTRUTURANDO Text para usar no link

const LoginPage = () => {
    const navigate = useNavigate();
    const notificationApi = useNotificationAPI(); // Inicializa o sistema de notificação
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
                notificationApi.error({
                    // Usa o hook para exibir o erro
                    message: 'Erro de Autenticação',
                    description: error.message, // Exibe a mensagem do Supabase (ex: Invalid login credentials)
                });
            } else if (data.session) {
                // 3. SUCESSO E REDIRECIONAMENTO: Se a sessão for estabelecida
                notificationApi.success({
                    // Usa o hook para exibir o sucesso
                    message: 'Login bem-sucedido!',
                    description: 'Você está sendo redirecionado.',
                    duration: 1.5,
                });

                // Redirecionamento imediato para o Dashboard
                navigate('/', { replace: true });
            }
        } catch (error) {
            // Erro de rede ou outro erro inesperado
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

                    {/* NOVO: Link para a página de cadastro */}
                    <div style={{ textAlign: 'center', marginTop: -10 }}>
                        <Text>Não possui uma conta ou organização?</Text>
                        <br />
                        <Link to="/auth/signup">
                            {/* O 'type="link"' do botão do Ant Design é uma boa opção de estilo para links */}
                            <Button
                                type="link"
                                style={{ padding: 0, fontWeight: 'bold' }}
                            >
                                Cadastre sua organização aqui!
                            </Button>
                        </Link>
                    </div>
                    {/* FIM DO NOVO BLOCO */}
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;
