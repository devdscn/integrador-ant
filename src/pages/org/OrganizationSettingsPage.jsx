// src/pages/org/OrganizationSettingsPage.jsx

import React, { useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Row,
    Col,
    Spin,
} from 'antd';
import {
    HomeOutlined,
    UsergroupAddOutlined,
    LoadingOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { useOrganization } from '../../hooks/useOrganization';
import { useNotificationAPI } from '../../components/NotificationProvider';

const { Title } = Typography;

const OrganizationSettingsPage = () => {
    const notificationApi = useNotificationAPI();
    const [form] = Form.useForm();

    const {
        organization,
        updateOrganization,
        isUpdatingOrganization,
        isLoadingOrganization,
        organizationUpdateError, // Objeto de erro da query
    } = useOrganization();

    // Efeito para preencher o formulário quando os dados da organização chegam
    useEffect(() => {
        if (organization) {
            // Os nomes dos campos devem corresponder à sua tabela 'organizations'
            form.setFieldsValue({
                nome: organization.nome,
                nome_fantasia: organization.nome_fantasia,
                documento: organization.documento, // CNPJ
                email: organization.email,
                numero_telefone: organization.numero_telefone,
                cep: organization.cep,
                logradouro: organization.logradouro,
                numero: organization.numero,
                complemento: organization.complemento,
                cidade: organization.cidade,
                estado: organization.estado,
                bairro: organization.bairro,
            });
        }
    }, [organization, form]);

    const onFinish = async (values) => {
        if (!organization?.id) {
            notificationApi.error({
                message: 'Erro',
                description:
                    'ID da organização não encontrado. Impossível salvar.',
            });
            return;
        }

        try {
            // Adiciona o ID da organização ao payload para a mutação
            await updateOrganization({
                ...values,
                id: organization.id,
            });

            notificationApi.success({
                message: 'Sucesso',
                description: 'Os dados da sua organização foram atualizados.',
            });
        } catch (err) {
            notificationApi.error({
                message: 'Erro ao Salvar',
                description: `Falha ao atualizar dados: ${err.message}`,
            });
        }
    };

    if (isLoadingOrganization) {
        return (
            <Row justify="center" style={{ padding: 50 }}>
                <Spin
                    indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                    tip="Carregando dados da organização..."
                />
            </Row>
        );
    }

    // TRATAMENTO DE ERRO: Renderiza a mensagem de erro se a query falhou
    if (organizationUpdateError) {
        return (
            <Card
                style={{ maxWidth: 600, margin: 'auto', textAlign: 'center' }}
            >
                <Title level={4} type="danger">
                    Erro ao carregar dados
                </Title>
                <p>
                    Ocorreu um erro ao buscar as configurações da organização.
                </p>
                {/* CORREÇÃO: Usa optional chaining para acessar a mensagem com segurança */}
                <pre style={{ textAlign: 'left', color: 'red' }}>
                    {organizationUpdateError?.message ||
                        'Erro sem detalhes. O objeto de erro era nulo.'}
                </pre>
            </Card>
        );
    }

    return (
        <Card
            title={<Title level={3}>Configurações da Organização</Title>}
            style={{ maxWidth: 800, margin: 'auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
            >
                {/* DADOS CADASTRAIS */}
                <Title level={5} style={{ marginBottom: 15 }}>
                    Dados Cadastrais
                </Title>

                {/* CNPJ (Documento) */}
                <Form.Item label="CNPJ (Documento Legal)" name="documento">
                    <Input
                        prefix={<IdcardOutlined />}
                        disabled
                        size="large"
                        placeholder="Documento legal da organização"
                    />
                </Form.Item>

                {/* RAZÃO SOCIAL */}
                <Form.Item
                    label="Razão Social"
                    name="nome"
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                >
                    <Input
                        prefix={<HomeOutlined />}
                        size="large"
                        placeholder="Nome completo de registro legal"
                    />
                </Form.Item>

                {/* NOME FANTASIA */}
                <Form.Item label="Nome Fantasia" name="nome_fantasia">
                    <Input
                        prefix={<UsergroupAddOutlined />}
                        size="large"
                        placeholder="Nome usual ou de marca"
                    />
                </Form.Item>

                {/* CONTATO */}
                <Divider />
                <Title level={5} style={{ marginBottom: 15 }}>
                    Contatos
                </Title>

                <Row gutter={16}>
                    <Col span={12}>
                        {/* E-MAIL */}
                        <Form.Item
                            label="E-mail Principal"
                            name="email"
                            rules={[
                                { type: 'email', message: 'E-mail inválido' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                size="large"
                                placeholder="contato@organizacao.com.br"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* TELEFONE */}
                        <Form.Item label="Telefone" name="numero_telefone">
                            <Input
                                prefix={<PhoneOutlined />}
                                size="large"
                                placeholder="+55 (XX) XXXXX-XXXX"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* ENDEREÇO */}
                <Divider />
                <Title level={5} style={{ marginBottom: 15 }}>
                    Endereço
                </Title>

                <Row gutter={16}>
                    <Col span={18}>
                        <Form.Item
                            label="Logradouro/Rua"
                            name="logradouro"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, insira o Logradouro/Rua da organização!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<EnvironmentOutlined />}
                                size="large"
                                placeholder="Nome da Rua"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Número"
                            name="numero"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira  o número!',
                                },
                            ]}
                        >
                            <Input size="large" placeholder="123" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Bairro"
                            name="bairro"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira  o bairro!',
                                },
                            ]}
                        >
                            <Input size="large" placeholder="Bairro" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Complemento" name="complemento">
                            <Input
                                size="large"
                                placeholder="Sala, Bloco, etc."
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="CEP" name="cep">
                            <Input size="large" placeholder="00000-000" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item
                            label="Cidade"
                            name="cidade"
                            rules={[
                                {
                                    required: true,
                                    message: 'Campo obrigatório',
                                },
                            ]}
                        >
                            <Input size="large" placeholder="Ex: São Paulo" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label="Estado"
                            name="estado"
                            rules={[
                                {
                                    required: true,
                                    message: 'Campo obrigatório',
                                },
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder="UF"
                                maxLength={2}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* BOTÃO DE SUBMISSÃO */}
                <Form.Item style={{ marginTop: 32 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingOrganization}
                        block
                        size="large"
                    >
                        {isUpdatingOrganization
                            ? 'Salvando...'
                            : 'Salvar Configurações'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default OrganizationSettingsPage;
