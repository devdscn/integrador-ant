import React, { useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Spin,
    Alert,
    Row,
    Col,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyOutlined,
    HomeOutlined,
    GlobalOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useNotificationAPI } from '../components/NotificationProvider';
import SpinComponent from '../components/SpinComponent';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const notificationApi = useNotificationAPI();
    const { id } = useParams(); // if id present => editing other user

    // agora useProfile aceita um id opcional
    const { data: profile, isLoading, isError, error } = useProfile(id);

    const {
        mutate: updateProfile,
        isPending: isSaving,
        isError: isSaveError,
        error: saveError,
    } = useUpdateProfile();

    useEffect(() => {
        if (profile) form.setFieldsValue(profile);
    }, [profile, form]);

    const onFinish = (values) => {
        const payload = {
            id: id || profile?.id,
            ...values,
        };

        updateProfile(payload, {
            onSuccess: () => {
                notificationApi.success({
                    message: id ? 'Usuário Atualizado' : 'Perfil Atualizado',
                    description: 'As alterações foram salvas com sucesso.',
                });
                if (id) navigate('/users');
            },
        });
    };

    const handleCancel = () => {
        navigate(id ? '/users' : '/');
    };

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                }}
            >
                <SpinComponent />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                message="Erro ao Carregar Perfil"
                description={`Não foi possível buscar os dados do perfil. Detalhes: ${error?.message}`}
                type="error"
                showIcon
            />
        );
    }

    const userEmail = profile?.email || 'N/A';
    const userRole = (profile?.role || 'user').toUpperCase();

    return (
        <>
            {/* TÍTULO DA PÁGINA */}
            <Title level={2} style={{ marginBottom: 24 }}>
                {id ? 'Editar Usuário' : 'Meu Perfil'}
            </Title>

            <Card>
                {/* INFORMAÇÕES DA CONTA (E-mail e Nível - Somente Leitura) */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={12}>
                        <Form.Item label={<Text strong>E-mail</Text>}>
                            <Input
                                prefix={<MailOutlined />}
                                value={userEmail}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={<Text strong>Nível de Acesso</Text>}>
                            <Input
                                prefix={<SafetyOutlined />}
                                value={userRole}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Alerta de Erro de Salvar */}
                {isSaveError && (
                    <Alert
                        message="Erro ao Salvar"
                        description={
                            saveError?.message ||
                            'Ocorreu um erro ao tentar salvar as alterações.'
                        }
                        type="error"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={profile}
                >
                    {/* LINHA 1: Nome e Apelido */}
                    <Row gutter={16}>
                        {/* Nome Completo (Obrigatório) */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="nome"
                                label="Nome Completo"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Campo obrigatório',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nome completo"
                                />
                            </Form.Item>
                        </Col>

                        {/* Apelido (Obrigatório) */}
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="apelido"
                                label="Apelido/Nome Curto"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Campo obrigatório',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Apelido"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* LINHA 2 (NOVA): Telefone, CPF e CNH - 3 CAMPOS EM UMA LINHA */}
                    <Row gutter={16}>
                        {/* Telefone (Obrigatório) - 8 COLUNAS */}
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="telefone"
                                label="Telefone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Campo obrigatório',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="(xx) xxxxx-xxxx"
                                />
                            </Form.Item>
                        </Col>

                        {/* CPF (Opcional) - 8 COLUNAS */}
                        <Col xs={24} md={8}>
                            <Form.Item name="cpf" label="CPF">
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="000.000.000-00"
                                />
                            </Form.Item>
                        </Col>

                        {/* CNH (Opcional) - 8 COLUNAS */}
                        <Col xs={24} md={8}>
                            <Form.Item name="cnh" label="CNH">
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Número da CNH"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* LINHA 3: Endereço e Número */}
                    <Row gutter={16}>
                        {/* Endereco (AGORA NÃO OBRIGATÓRIO) */}
                        <Col xs={24} md={16}>
                            <Form.Item name="endereco" label="Endereço">
                                <Input
                                    prefix={<HomeOutlined />}
                                    placeholder="Rua, Avenida, etc."
                                />
                            </Form.Item>
                        </Col>

                        {/* Numero (Opcional) */}
                        <Col xs={24} md={8}>
                            <Form.Item name="numero" label="Número">
                                <Input placeholder="123" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* LINHA 4: Bairro e CEP */}
                    <Row gutter={16}>
                        {/* Bairro (Opcional) */}
                        <Col xs={24} md={12}>
                            <Form.Item name="bairro" label="Bairro">
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Bairro"
                                />
                            </Form.Item>
                        </Col>

                        {/* CEP (Opcional) */}
                        <Col xs={24} md={12}>
                            <Form.Item name="cep" label="CEP">
                                <Input placeholder="00000-000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* LINHA 5: Cidade e UF */}
                    <Row gutter={16}>
                        {/* Cidade (Opcional) */}
                        <Col xs={24} md={12}>
                            <Form.Item name="cidade" label="Cidade">
                                <Input
                                    prefix={<GlobalOutlined />}
                                    placeholder="Cidade"
                                />
                            </Form.Item>
                        </Col>

                        {/* UF (Opcional) */}
                        <Col xs={24} md={12}>
                            <Form.Item name="uf" label="UF">
                                <Input
                                    placeholder="SP, RJ, BA..."
                                    maxLength={2}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="default" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSaving}
                            >
                                Salvar
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </>
    );
};

export default ProfilePage;
