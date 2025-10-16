import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Alert,
    Row,
    Col,
    Space,
} from 'antd';
import {
    MailOutlined,
    LockOutlined,
    GlobalOutlined,
    SolutionOutlined,
    HomeOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
// Importação do hook customizado para exibir notificações (assumindo que existe)
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title, Text } = Typography;

const SignUpPage = () => {
    const navigate = useNavigate();
    const notificationApi = useNotificationAPI();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Usado para erros no formulário

    // Função que será chamada ao submeter o formulário
    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        // Desestrutura todos os campos do formulário
        const { email, password, cnpj, corporate_name, city } = values;

        try {
            // =======================================================
            // PASSO 1: CRIAÇÃO SEGURA DO USUÁRIO (supabase.auth.signUp)
            // =======================================================
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                // Trata erros de autenticação (ex: e-mail já registrado)
                throw new Error(authError.message);
            }

            // Se a criação do usuário for bem-sucedida, o JWT está ativo.
            // =======================================================
            // PASSO 2: CRIAÇÃO DO TENANT VIA RPC (3 PARÂMETROS)
            // =======================================================
            const rpcPayload = {
                // Os nomes DEVEM corresponder à assinatura da função no Postgres:
                // sign_up_and_create_tenant(org_cnpj, org_corporate_name, org_city)
                org_cnpj: cnpj,
                org_corporate_name: corporate_name,
                org_city: city,
            };

            const { data: orgId, error: rpcError } = await supabase.rpc(
                'sign_up_and_create_tenant',
                rpcPayload
            );

            if (rpcError) {
                // Trata erros da RPC (ex: CNPJ duplicado, falha na transação)
                // É CRUCIAL: Se a RPC falhar, o usuário criado no Passo 1 é órfão.
                // Você pode adicionar uma chamada para deletar o usuário aqui se a transação falhar.
                throw new Error(rpcError.message);
            }

            // =======================================================
            // SUCESSO E REDIRECIONAMENTO
            // =======================================================
            notificationApi.success({
                message: 'Cadastro concluído!',
                description:
                    'Organização e conta criadas. Por favor, faça login.',
                duration: 5,
            });

            // Redireciona para a página de login
            navigate('/auth/login', { replace: true });
        } catch (err) {
            console.error('Erro no cadastro:', err);
            setError(
                err.message ||
                    'Ocorreu um erro no cadastro. Verifique os dados e tente novamente.'
            );

            // Sugestão de notificação (além do erro no formulário)
            notificationApi.error({
                message: 'Falha no Cadastro',
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row
            justify="center"
            align="middle"
            style={{ minHeight: '100vh', background: '#f0f2f5' }}
        >
            <Col xs={24} sm={18} md={12} lg={10} xl={8}>
                <Card
                    title={
                        <Title level={3} style={{ textAlign: 'center' }}>
                            Cadastro do Novo Tenant
                        </Title>
                    }
                    bordered={false}
                    style={{
                        borderRadius: 8,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Exibe mensagem de erro se houver */}
                    {error && (
                        <Alert
                            message="Erro de Cadastro"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Form
                        name="signup_tenant"
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        {/* =======================================================
                            1. DADOS DO ADMINISTRADOR (Primeiro Usuário)
                        ======================================================= */}
                        <Title level={5} style={{ marginTop: 0 }}>
                            Dados do Administrador
                        </Title>

                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, insira um e-mail válido!',
                                },
                                { type: 'email', message: 'E-mail inválido!' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="E-mail (Será o seu login)"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira uma senha!',
                                },
                                {
                                    min: 6,
                                    message:
                                        'A senha deve ter pelo menos 6 caracteres.',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Senha"
                                size="large"
                            />
                        </Form.Item>

                        {/* =======================================================
                            2. DADOS DA ORGANIZAÇÃO (O Tenant)
                        ======================================================= */}
                        <Title level={5} style={{ marginTop: 24 }}>
                            Dados da Organização
                        </Title>

                        <Form.Item
                            name="corporate_name"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, insira a Razão Social!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<GlobalOutlined />}
                                placeholder="Razão Social (Nome Legal)"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="cnpj"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira o CNPJ!',
                                },
                                {
                                    len: 14,
                                    message: 'O CNPJ deve ter 14 dígitos.',
                                },
                            ]}
                        >
                            <Input
                                prefix={<SolutionOutlined />}
                                placeholder="CNPJ (Somente dígitos)"
                                size="large"
                                maxLength={14}
                            />
                            {/* Recomenda-se adicionar um componente de máscara aqui */}
                        </Form.Item>

                        <Form.Item
                            name="city"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira a Cidade!',
                                },
                            ]}
                            tooltip="Campo obrigatório para a criação do Tenant (conforme a estrutura)"
                        >
                            <Input
                                prefix={<HomeOutlined />}
                                placeholder="Cidade Sede"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: 32 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                icon={loading ? <LoadingOutlined /> : null}
                            >
                                {loading
                                    ? 'Criando Conta...'
                                    : 'Criar Conta e Organização'}
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Text>Já possui uma conta?</Text>
                            <br />
                            <Link to="/auth/login">
                                <Button
                                    type="link"
                                    style={{ padding: 0, fontWeight: 'bold' }}
                                >
                                    Ir para o Login
                                </Button>
                            </Link>
                        </div>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default SignUpPage;
