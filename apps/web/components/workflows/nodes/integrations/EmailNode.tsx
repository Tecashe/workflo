"use client";
import { Mail } from 'lucide-react';
import BaseNode from '../BaseNode';

interface EmailNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    provider?: string;
}

export default function EmailNode({ data, id, selected }: {
    data: EmailNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.provider;

    let defaultSubtitle = 'Configure Email';
    if (isConfigured) {
        if (data.provider === 'resend') defaultSubtitle = 'Send via Resend';
        else if (data.provider === 'smtp') defaultSubtitle = 'Send via SMTP';
    }

    const subtitle = data.subtitle || defaultSubtitle;

    return (
        <BaseNode
            id={id}
            selected={selected}
            nodeType="emailNode"
            icon={<Mail size={40} className="text-[#3b82f6]" />}
            label={data.label || 'Email'}
            subtitle={subtitle}
            isConfigured={isConfigured}
        />
    );
}
