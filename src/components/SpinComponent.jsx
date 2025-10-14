import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const contentStyle = {
    // padding: 200,
    // background: 'rgba(0, 0, 0, 0.05)',
    // borderRadius: 4,

    display: 'flex',
    justifyContent: 'center', // Centraliza horizontalmente
    alignItems: 'center', // Centraliza verticalmente
    height: '100vh', // Ocupa a altura total da viewport
    width: '100%',

    // backgroundColor: 'white', // Pode adicionar a cor de fundo desejada
};

const content = <div style={contentStyle} />;

const SpinComponent = () => (
    // <Spin tip="Carregando" size="large" fullscreen={false}>
    //     {content}
    // </Spin>

    <Spin indicator={<LoadingOutlined style={{ fontSize: 58 }} />}>
        {content}
    </Spin>
);
export default SpinComponent;
