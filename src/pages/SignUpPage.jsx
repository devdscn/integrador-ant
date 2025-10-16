import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Row, Col } from 'antd';
import {
    MailOutlined,
    LockOutlined,
    GlobalOutlined,
    SolutionOutlined,
    PhoneOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title, Text } = Typography;

const SignUpPage = () => {
    const navigate = useNavigate();
    const notificationApi = useNotificationAPI();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const showRpcError = (message) => {
        setError(message);
        notificationApi.error({
            message: 'Falha na Criação da Organização',
            description: message,
            duration: 8,
        });
    };

    const showSuccess = (message) => {
        notificationApi.success({
            message: 'Cadastro Concluído!',
            description: message,
            duration: 5,
        });
    };

    // FUNÇÃO PRINCIPAL DE SUBMISSÃO
    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        const {
            email,
            password,
            documento,
            nome,
            nome_fantasia,
            numero_telefone,
            cep,
            numero,
            complemento, // Opcional
            cidade,
            estado,
        } = values;

        // CORREÇÃO CRÍTICA: Garante que complemento seja uma string vazia se estiver undefined/null
        // para que o PostgREST o inclua na payload de 9 parâmetros.
        const safeComplemento = complemento ?? '';

        try {
            // =======================================================
            // PASSO 1: CRIAÇÃO DO USUÁRIO
            // =======================================================
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                throw new Error(authError.message);
            }

            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError || !sessionData.session) {
                throw new Error(
                    'Usuário criado, mas sessão não iniciada. Verifique as configurações de confirmação de e-mail.'
                );
            }

            // =======================================================
            // PASSO 2: CRIAÇÃO DO TENANT VIA RPC (9 PARÂMETROS GARANTIDOS)
            // =======================================================
            const rpcPayload = {
                org_documento: documento,
                org_nome: nome,
                org_nome_fantasia: nome_fantasia,
                org_numero_telefone: numero_telefone,
                org_cep: cep,
                org_numero: numero,
                org_complemento: safeComplemento, // AGORA GARANTIDO
                org_cidade: cidade,
                org_estado: estado,
            };

            const { data: orgId, error: rpcError } = await supabase.rpc(
                'sign_up_and_create_tenant',
                rpcPayload
            );

            if (rpcError) {
                throw new Error(rpcError.message);
            }

            // =======================================================
            // SUCESSO
            // =======================================================
            await supabase.auth.signOut();

            showSuccess(
                'Organização criada! Faça login com suas novas credenciais.'
            );

            navigate('/auth/login', { replace: true });
        } catch (err) {
            showRpcError(
                err.message ||
                    'Ocorreu um erro desconhecido durante o cadastro.'
            );
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
            <Col xs={24} sm={20} md={16} lg={14} xl={12}>
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
                        requiredMark={false}
                    >
                        {/* =======================================================
                            1. DADOS DE ACESSO E CONTATO
                        ======================================================= */}
                        <Title level={5} style={{ marginTop: 0 }}>
                            Acesso e Contato
                        </Title>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'O e-mail é obrigatório!',
                                        },
                                        {
                                            type: 'email',
                                            message: 'E-mail inválido!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder="E-mail (Seu Login)"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'A senha é obrigatória!',
                                        },
                                        {
                                            min: 6,
                                            message: 'Mínimo 6 caracteres.',
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Senha"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="numero_telefone"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'O Telefone é obrigatório!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="Telefone (DDD + Número)"
                                        size="large"
                                        maxLength={11}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}></Col>
                        </Row>

                        {/* =======================================================
                            2. DADOS CADASTRAIS DA ORGANIZAÇÃO
                        ======================================================= */}
                        <Title level={5} style={{ marginTop: 24 }}>
                            Dados Cadastrais
                        </Title>

                        {/* Razão Social (Nome Legal) - Fica sozinha na linha */}
                        <Form.Item
                            name="nome"
                            rules={[
                                {
                                    required: true,
                                    message: 'A Razão Social é obrigatória!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<GlobalOutlined />}
                                placeholder="Razão Social (Nome Legal)"
                                size="large"
                            />
                        </Form.Item>

                        {/* Nome Fantasia e Documento (Na mesma linha horizontal) */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="nome_fantasia"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'O Nome Fantasia é obrigatório!',
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="Nome Fantasia"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="documento" // CNPJ/CPF
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'O CNPJ/CPF é obrigatório!',
                                        },
                                        {
                                            len: 14,
                                            message: 'Deve ter 14 dígitos.',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<SolutionOutlined />}
                                        placeholder="Documento (CNPJ/CPF - 14 dígitos)"
                                        size="large"
                                        maxLength={14}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* =======================================================
                            3. ENDEREÇO 
                        ======================================================= */}
                        <Title level={5} style={{ marginTop: 24 }}>
                            Endereço
                        </Title>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="cep"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'O CEP é obrigatório!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<HomeOutlined />}
                                        placeholder="CEP"
                                        size="large"
                                        maxLength={8}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="numero"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'O Número é obrigatório!',
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="Número"
                                        size="large"
                                        maxLength={10}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="complemento" // Opcional
                                >
                                    <Input
                                        placeholder="Complemento (Opcional)"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={18}>
                                <Form.Item
                                    name="cidade"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'A Cidade é obrigatória!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<EnvironmentOutlined />}
                                        placeholder="Cidade"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="estado"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'O Estado (UF) é obrigatório!',
                                        },
                                        {
                                            len: 2,
                                            message: 'Deve ter 2 caracteres.',
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="UF (Ex: BA)"
                                        size="large"
                                        maxLength={2}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

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
