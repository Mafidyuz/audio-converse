import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Button, Input, Card, Row, Col, Typography, Space, message } from 'antd';
import { UploadOutlined, AudioOutlined, FileTextOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';
import { ReactMic } from 'react-mic';
import './MeetingForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const MeetingForm = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [transcription, setTranscription] = useState("");
    const [summary, setSummary] = useState("");
    const [isEditable, setIsEditable] = useState({ transcription: true, summary: true });
    const [transcriptionConfirmed, setTranscriptionConfirmed] = useState(false);
    const [summaryConfirmed, setSummaryConfirmed] = useState(false);

    const backendUrl = 'http://localhost:5000';

    const handleUpload = (file) => {
        setAudioFile(file);
        setRecordedBlob(null);
        return false;
    };

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
            const response = await axios.post(`${backendUrl}/transcribe`, formData);
            setTranscription(response.data.transcription);
            setIsEditable(prev => ({ ...prev, transcription: true }));
            setTranscriptionConfirmed(false); // Reset confirmation state if new transcription is made
            message.success('Transcription completed!');
        } catch (error) {
            console.error("Error during transcription:", error);
            message.error('Transcription failed.');
        }
    };

    const handleSummary = async () => {
        try {
            const response = await axios.post(`${backendUrl}/summarize`, { transcription });
            setSummary(response.data.summary);
            setIsEditable(prev => ({ ...prev, summary: true }));
            setSummaryConfirmed(false); // Reset confirmation state if new summary is made
            message.success('Summary generated!');
        } catch (error) {
            console.error("Error during summarization:", error);
            message.error('Summary failed.');
        }
    };

    // Confirm transcription only
    const handleConfirmTranscription = async () => {
        try {
            await axios.post(`${backendUrl}/confirm`, { transcription });
            message.success('Transcription confirmed and saved!');
            setIsEditable(prev => ({ ...prev, transcription: false }));
            setTranscriptionConfirmed(true); // Set confirmation state
        } catch (error) {
            console.error("Error saving transcription:", error);
            message.error('Saving transcription failed.');
        }
    };

    // Confirm summary only
    const handleConfirmSummary = async () => {
        try {
            await axios.post(`${backendUrl}/confirm`, { summary });
            message.success('Summary confirmed and saved!');
            setIsEditable(prev => ({ ...prev, summary: false }));
            setSummaryConfirmed(true); // Set confirmation state
        } catch (error) {
            console.error("Error saving summary:", error);
            message.error('Saving summary failed.');
        }
    };

    const startRecording = () => {
        setRecording(true);
        setAudioFile(null);
    };

    const stopRecording = () => {
        setRecording(false);
    };

    const onStopRecording = (recordedBlob) => {
        setRecordedBlob(recordedBlob);
        setAudioFile(null);
    };

    return (
        <div className="new-meeting-form">
            <Row justify="center" gutter={[32, 32]} style={{ marginBottom: '32px' }}>
                <Col span={24}>
                    <Card className="action-card" hoverable>
                        <Space direction="vertical" size="large" align="center">
                            <Title level={4}>Audio Input</Title>
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
                            </Dragger>

                            {audioFile && <Text strong>{audioFile.name}</Text>}

                            <Space size="large">
                                <Button onClick={startRecording} icon={<AudioOutlined />} size="large" disabled={recording}>
                                    Record Audio
                                </Button>
                                <Button onClick={stopRecording} icon={<StopOutlined />} size="large" disabled={!recording} danger>
                                    Stop Recording
                                </Button>
                            </Space>

                            <ReactMic
                                record={recording}
                                onStop={onStopRecording}
                                mimeType="audio/wav"
                                strokeColor="#FF4081"
                                backgroundColor="#F0F0F0"
                            />

                            {(recordedBlob || audioFile) && (
                                <Button type="primary" size="large" onClick={handleTranscription} icon={<FileTextOutlined />}>
                                    Transcribe Audio
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[32, 32]} style={{ marginBottom: '32px' }}>
                <Col span={12}>
                    <Card title="Transcription">
                        <TextArea
                            value={transcription}
                            onChange={(e) => setTranscription(e.target.value)}
                            rows={8}
                            readOnly={!isEditable.transcription}
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleConfirmTranscription}
                            icon={<CheckOutlined />}
                            disabled={!transcription || transcriptionConfirmed}
                            style={{ marginTop: '16px' }}
                        >
                            {transcriptionConfirmed ? 'Confirmed' : 'Confirm Transcription'}
                        </Button>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Summary">
                        <TextArea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={8}
                            readOnly={!isEditable.summary}
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleConfirmSummary}
                            icon={<CheckOutlined />}
                            disabled={!summary || summaryConfirmed}
                            style={{ marginTop: '16px' }}
                        >
                            {summaryConfirmed ? 'Confirmed' : 'Confirm Summary'}
                        </Button>
                    </Card>
                </Col>
            </Row>

            <Row justify="center">
                <Col>
                    <Button type="primary" size="large" onClick={handleSummary} icon={<FileTextOutlined />} disabled={!transcription}>
                        Generate Summary
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default MeetingForm;
