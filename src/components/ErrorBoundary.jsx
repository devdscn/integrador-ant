import React from 'react';
import { Alert, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        this.setState({ info });
        // opcional: console.log para terminal
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught', error, info);
    }

    handleReload = () => {
        this.setState({ error: null, info: null });
        window.location.reload();
    };

    render() {
        const { error } = this.state;
        if (error) {
            return (
                <div style={{ padding: 24 }}>
                    <Alert
                        type="error"
                        showIcon
                        message="Erro em tempo de execução"
                        description={
                            <>
                                <div style={{ marginBottom: 12 }}>
                                    {error?.message}
                                </div>
                                <pre
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    }}
                                >
                                    {this.state.info?.componentStack || ''}
                                </pre>
                                <div style={{ marginTop: 12 }}>
                                    <Button
                                        type="primary"
                                        onClick={this.handleReload}
                                        style={{ marginRight: 8 }}
                                    >
                                        Recarregar
                                    </Button>
                                </div>
                            </>
                        }
                    />
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
