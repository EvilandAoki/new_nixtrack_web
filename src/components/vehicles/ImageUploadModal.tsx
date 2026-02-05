import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Checkbox, message, Button, Space } from 'antd';
import { InboxOutlined, DeleteOutlined, FileImageOutlined } from '@ant-design/icons';

interface ImageUploadModalProps {
    visible: boolean;
    onCancel: () => void;
    onUpload: (file: File, description: string, isMainPhoto: boolean) => Promise<void>;
    loading: boolean;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    visible,
    onCancel,
    onUpload,
    loading,
}) => {
    const [form] = Form.useForm();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const handleFile = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            messageApi.error('¡Solo puedes subir archivos JPG, PNG o WEBP!');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            messageApi.error('El archivo es demasiado grande (Máx. 10MB)');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleOk = async () => {
        try {
            if (!selectedFile) {
                messageApi.warning('Por favor selecciona una imagen');
                return;
            }

            const values = await form.validateFields();
            await onUpload(selectedFile, values.description || '', values.is_main_photo || false);

            handleCancel();
        } catch (error) {
            // Error de validación de formulario
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        form.resetFields();
        onCancel();
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Subir Nueva Foto"
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText="Subir"
                cancelText="Cancelar"
                width={600}
            >
                <Form form={form} layout="vertical" initialValues={{ is_main_photo: false }}>
                    <Form.Item label="Seleccionar Imagen" required>
                        <div
                            style={{
                                border: `2px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
                                borderRadius: '8px',
                                padding: '24px',
                                textAlign: 'center',
                                backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />

                            {!previewUrl ? (
                                <div style={{ color: '#00000073' }}>
                                    <p style={{ fontSize: '48px', color: '#1890ff' }}><InboxOutlined /></p>
                                    <p style={{ fontSize: '16px', fontWeight: 500 }}>Haz clic o arrastra una imagen aquí</p>
                                    <p>Soporta JPG, PNG y WEBP (Máx. 10MB)</p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    />
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <FileImageOutlined style={{ color: '#52c41a' }} />
                                        <span style={{ color: '#000000a6' }}>{selectedFile?.name}</span>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                        >
                                            Quitar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Form.Item>

                    <Form.Item name="description" label="Descripción">
                        <Input.TextArea rows={3} placeholder="Añade una descripción para esta foto..." />
                    </Form.Item>

                    <Form.Item name="is_main_photo" valuePropName="checked">
                        <Checkbox>Establecer como foto principal</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ImageUploadModal;
