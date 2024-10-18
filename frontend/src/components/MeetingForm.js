import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Button, Input, Card, Row, Col, Typography, Space, message } from 'antd';
import { UploadOutlined, AudioOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons';
import { ReactMic } from 'react-mic';
import './MeetingForm.css'; // Updated styles for the new form

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload; // Import Dragger

const MeetingForm = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [transcription, setTranscription] = useState("");
    const [summary, setSummary] = useState("");

    const handleUpload = (file) => {
        setAudioFile(file);
        setRecordedBlob(null); // Clear previous recordings
        return false; // Prevent auto-upload
    };

    const backendUrl = 'http://localhost:5000'; // Your backend URL

    const handleTranscription = async () => {
        const formData = new FormData();
        if (audioFile) {
            formData.append('file', audioFile);
        } else if (recordedBlob) {
            formData.append('file', recordedBlob.blob, 'recording.wav');
        } else {
            return;
        }

        try {
            const response = await axios.post(`${backendUrl}/transcribe`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setTranscription(response.data.transcription);
            message.success('Transcription completed!');
        } catch (error) {
            console.error("Error during transcription:", error);
            message.error('Transcription failed.');
        }
    };

    const handleSummary = async () => {
        try {
            const response = await axios.post(`${backendUrl}/summarize`, {
                transcription: transcription,
            });
            setSummary(response.data.summary);
            message.success('Summary generated!');
        } catch (error) {
            console.error("Error during summarization:", error);
            message.error('Summary failed.');
        }
    };

    const startRecording = () => {
        setRecording(true);
        setAudioFile(null); // Clear uploaded file if recording starts
    };

    const stopRecording = () => {
        setRecording(false);
    };

    const onStopRecording = (recordedBlob) => {
        setRecordedBlob(recordedBlob);
        setAudioFile(null); // Use the recording
    };

    return (
        <div className="new-meeting-form">
            <Row justify="center" gutter={[32, 32]} style={{ marginBottom: '32px' }}>
                <Col span={24}>
                    <Card className="action-card" hoverable>
                        <Space direction="vertical" size="large" align="center">
                            <Title level={4}>Audio Input</Title>

                            {/* Dragger for Drag-and-Drop upload */}
                            <Dragger
                                beforeUpload={handleUpload}
                                showUploadList={false}
                                accept="audio/*"
                                className="drag-upload"
                            >
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                                </p>
                                <p className="ant-upload-text">Click or drag audio files to upload</p>
                                <p className="ant-upload-hint">Supports MP3, WAV, and other audio formats.</p>
                            </Dragger>

                            {/* Optional file name display */}
                            {audioFile && <Text strong>{audioFile.name}</Text>}

                            <Space size="large">
                                <Button
                                    onClick={startRecording}
                                    icon={<AudioOutlined />}
                                    size="large"
                                    disabled={recording}
                                    className="record-button"
                                >
                                    Record Audio
                                </Button>
                                <Button
                                    onClick={stopRecording}
                                    icon={<StopOutlined />}
                                    size="large"
                                    disabled={!recording}
                                    danger
                                >
                                    Stop Recording
                                </Button>
                            </Space>

                            <ReactMic
                                record={recording}
                                className="sound-wave"
                                onStop={onStopRecording}
                                mimeType="audio/wav"
                                strokeColor="#FF4081"
                                backgroundColor="#F0F0F0"
                                style={{ marginTop: '24px', marginBottom: '24px' }}
                            />

                            {(recordedBlob || audioFile) && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleTranscription}
                                    icon={<FileTextOutlined />}
                                    className="transcribe-button"
                                    style={{ marginTop: '16px' }}
                                >
                                    Transcribe Audio
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[32, 32]} style={{ marginBottom: '32px' }}>
                <Col span={12}>
                    <Card title="Transcription" className="result-card">
                        <TextArea value={transcription} rows={8} readOnly style={{ padding: '12px' }} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Summary" className="result-card">
                        <TextArea value={summary} rows={8} readOnly style={{ padding: '12px' }} />
                    </Card>
                </Col>
            </Row>

            <Row justify="center">
                <Col>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSummary}
                        icon={<FileTextOutlined />}
                        disabled={!transcription}
                        className="summarize-button"
                        style={{ marginTop: '16px' }}
                    >
                        Generate Summary
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default MeetingForm;
