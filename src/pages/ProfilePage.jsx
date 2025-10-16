import { useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Row,
    Spin,
    Divider,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../components/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { useNotificationAPI } from '../components/NotificationProvider';

const { Title } = Typography;

const ProfilePage = () => {
    const { user } = useAuth();
    const notificationApi = useNotificationAPI();
    const [form] = Form.useForm();

    const { personalProfile, updatePersonalProfile, isUpdatingPersonal } =
        useProfile();

    // Efeito para preencher o formulário
    useEffect(() => {
        if (personalProfile) {
            form.setFieldsValue({
                // LÊ O TELEFONE DO NOVO LOCAL: personalProfile.phone (que o hook pegou dos metadados)
                display_name: personalProfile.display_name,
                email: personalProfile.email,
                phone: personalProfile.phone,
            });
        }
    }, [personalProfile, form]);

    // Lógica de submissão
    const onFinish = async (values) => {
        if (!user) return;

        try {
            // Os valores são enviados para o hook, que os coloca no user_metadata
            await updatePersonalProfile({
                display_name: values.display_name,
                phone: values.phone,
            });

            notificationApi.success({
                message: 'Sucesso',
                description: 'Seu perfil pessoal foi atualizado.',
            });
        } catch (error) {
            notificationApi.error({
                message: 'Erro ao Salvar',
                description: `Falha ao atualizar dados: ${error.message}`,
            });
        }
    };

    if (!user) {
        return (
            <Row justify="center" style={{ padding: 50 }}>
                <Spin
                    indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                    tip="Carregando dados..."
                />
            </Row>
        );
    }

    return (
        <Card
            title={<Title level={3}>Meu Perfil Pessoal</Title>}
            style={{ maxWidth: 600, margin: 'auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
            >
                {/* =======================================================
                    DADOS BÁSICOS (LEITURA)
                ======================================================= */}
                <Title level={5}>Dados de Acesso</Title>
                <Form.Item label="E-mail" name="email">
                    <Input prefix={<MailOutlined />} disabled size="large" />
                </Form.Item>

                {/* =======================================================
                    DADOS PESSOAIS EDITÁVEIS
                ======================================================= */}
                <Divider />
                <Title level={5}>Informações Pessoais</Title>

                {/* NOME DE EXIBIÇÃO (Metadados) */}
                <Form.Item
                    label="Nome de Exibição (Display Name)"
                    name="display_name"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira seu nome de exibição!',
                        },
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Nome para ser exibido no App"
                        size="large"
                    />
                </Form.Item>

                {/* TELEFONE (Metadados) */}
                <Form.Item
                    label="Telefone"
                    name="phone"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira seu telefone!',
                        },
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Seu telefone (Ex: +55...)"
                        size="large"
                    />
                </Form.Item>

                {/* BOTÃO DE SUBMISSÃO */}
                <Form.Item style={{ marginTop: 32 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingPersonal}
                        block
                        size="large"
                    >
                        {isUpdatingPersonal
                            ? 'Salvando...'
                            : 'Salvar Perfil Pessoal'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ProfilePage;
