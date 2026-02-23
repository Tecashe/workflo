"use client";
import { MessageCircle } from 'lucide-react';
import BaseNode from '../BaseNode';

interface WhatsAppNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    operation?: string;
    credentialId?: string;
}

export default function WhatsAppNode({ data, id, selected }: {
    data: WhatsAppNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.credentialId && !!data.operation;

    let defaultSubtitle = 'Configure WhatsApp';
    if (isConfigured) {
        if (data.operation === 'send_message') defaultSubtitle = 'Send Message';
        else if (data.operation === 'send_template') defaultSubtitle = 'Send Template';
    }

    const subtitle = data.subtitle || defaultSubtitle;

    return (
        <BaseNode
            id={id}
            selected={selected}
            nodeType="whatsappNode"
            icon={<MessageCircle size={40} className="text-[#25D366]" />}
            label={data.label || 'WhatsApp'}
            subtitle={subtitle}
            isConfigured={isConfigured}
        />
    );
}
