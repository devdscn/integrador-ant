import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
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
import { supabase } from '../services/supabase';

const { Title, Text } = Typography;

const EditProfilePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const notificationApi = useNotificationAPI();
    const { id } = useParams(); // se existir => editar outro usuário (admin); se não => editar próprio perfil

    // Dados do usuário autenticado
    const {
        data: profile,
        isLoading: isProfileLoading,
        isError: isProfileError,
        error: profileError,
    } = useProfile();

    // Mutação para salvar (usa hook existente)
    const {
        mutate: updateProfile,
        isPending: isSaving,
        isError: isSaveError,
        error: saveError,
    } = useUpdateProfile();

    // Estado local para quando estivermos editando outro usuário pelo :id
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [userFetchError, setUserFetchError] = useState(null);

    // Carrega usuário por id (admin) se id estiver presente
    useEffect(() => {
        let mounted = true;
        const fetchUser = async () => {
            if (!id) return;
            setIsUserLoading(true);
            setUserFetchError(null);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                if (mounted) setUser(data);
            } catch (err) {
                if (mounted) setUserFetchError(err);
            } finally {
                if (mounted) setIsUserLoading(false);
            }
        };

        fetchUser();
        return () => {
            mounted = false;
        };
    }, [id]);

    // Popula o formulário quando os dados estiverem disponíveis
    useEffect(() => {
        const source = id ? user : profile;
        if (source) {
            // Normaliza campos esperados pelo formulário
            form.setFieldsValue({
                nome: source.nome || '',
                apelido: source.apelido || '',
                telefone: source.telefone || '',
                cpf: source.cpf || '',
                cnh: source.cnh || '',
                endereco: source.endereco || '',
                numero: source.numero || '',
                bairro: source.bairro || '',
                cep: source.cep || '',
                cidade: source.cidade || '',
                uf: source.uf || '',
                email: source.email || '',
                role: source.role || '',
            });
        } else {
            form.resetFields();
        }
    }, [profile, user, id, form]);

    const onFinish = (values) => {
        const payload = {
            id: id || profile?.id,
            ...values,
        };

        updateProfile(payload, {
            onSuccess: () => {
                notificationApi.success({
                    message: 'Perfil salvo',
                    description: 'As alterações foram persistidas com sucesso.',
                });
                navigate(id ? '/users' : '/');
            },
            onError: (err) => {
                notificationApi.error({
                    message: 'Erro ao salvar',
                    description:
                        err?.message || 'Não foi possível salvar o perfil.',
                });
            },
        });
    };

    const handleCancel = () => {
        navigate(id ? '/users' : '/');
    };

    const isLoading = isProfileLoading || isUserLoading;
    const isError =
        (id ? userFetchError : profileError) || (id ? false : isProfileError);

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <SpinComponent />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                message="Erro ao carregar dados"
                description={
                    (id ? userFetchError?.message : profileError?.message) ||
                    'Não foi possível recuperar os dados do usuário.'
                }
                type="error"
                showIcon
            />
        );
    }

    const source = id ? user : profile;
    const userEmail = source?.email || 'N/A';
    const userRole = (source?.role || 'user').toUpperCase();

    return (
        <>
            <Title level={2} style={{ marginBottom: 24 }}>
                {id ? 'Editar Usuário' : 'Editar Perfil'}
            </Title>

            <Card>
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

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
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

                    <Row gutter={16}>
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

                        <Col xs={24} md={8}>
                            <Form.Item name="cpf" label="CPF">
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="000.000.000-00"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="cnh" label="CNH">
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Número da CNH"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={16}>
                            <Form.Item name="endereco" label="Endereço">
                                <Input
                                    prefix={<HomeOutlined />}
                                    placeholder="Rua, Avenida, etc."
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item name="numero" label="Número">
                                <Input placeholder="123" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="bairro" label="Bairro">
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Bairro"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="cep" label="CEP">
                                <Input placeholder="00000-000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="cidade" label="Cidade">
                                <Input
                                    prefix={<GlobalOutlined />}
                                    placeholder="Cidade"
                                />
                            </Form.Item>
                        </Col>

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

export default EditProfilePage;
