// App.js
import React, { useState } from 'react';
import { Layout, Typography, Row, Col } from 'antd';
import MeetingForm from './components/MeetingForm';
import './App.css'; // Importing the external CSS

const { Header, Content } = Layout;

function App() {
    // State to control the visibility of the chat window (without unmounting it)
    const [isChatVisible, setIsChatVisible] = useState(false);

    // Toggle function to show/hide the chat
    const toggleChatVisibility = () => {
        setIsChatVisible(!isChatVisible);
    };

    return (
        <Layout className="app-layout">
            {/* Header Section */}
            <Header className="app-header">
                <Typography.Title level={3} className="app-title">
                    AudioConverse
                </Typography.Title>
            </Header>

            {/* Main Content Section */}
            <Content className="app-content">
                <Row gutter={[16, 16]} className="app-row" justify="center">
                    {/* Meeting Form Column */}
                    <Col xs={24} md={24} lg={24}>
                        <MeetingForm />
                    </Col>
                </Row>
            </Content>

            {/* Floating Chatbot Popup */}
            <div className="chatbot-container">
                {/* Chat Toggle Button */}
                <button 
                    onClick={toggleChatVisibility} 
                    className="chat-toggle-btn"
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#1a3b57')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#0d253f')}
                >
                    {isChatVisible ? 'X' : '💬'}
                </button>

                {/* Chat Window */}
                <div className={`chat-window ${isChatVisible ? 'chat-visible' : 'chat-hidden'}`}>
                    {/* Chat Header */}
                    <div className="chat-header">
                        Chat Assistant
                    </div>

                    {/* Chat Content (Iframe) */}
                    <div className="chat-content">
                        <iframe
                            title="Chatbot"
                            src="http://localhost:8501"
                            className="chat-iframe"
                        ></iframe>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default App;
