"use client";
import { Smartphone } from 'lucide-react';
import BaseNode from '../BaseNode';

interface MpesaNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    operation?: string;
    credentialId?: string;
}

export default function MpesaNode({ data, id, selected }: {
    data: MpesaNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.credentialId && !!data.operation;

    let defaultSubtitle = 'Configure M-Pesa';
    if (isConfigured) {
        if (data.operation === 'stk_push') defaultSubtitle = 'STK Push';
        else if (data.operation === 'check_status') defaultSubtitle = 'Check Status';
        else if (data.operation === 'b2c') defaultSubtitle = 'Send B2C';
    }

    const subtitle = data.subtitle || defaultSubtitle;

    return (
        <BaseNode
            id={id}
            selected={selected}
            nodeType="mpesaNode"
            icon={<Smartphone size={40} className="text-[#00E676]" />}
            label={data.label || 'M-Pesa'}
            subtitle={subtitle}
            isConfigured={isConfigured}
        />
    );
}
