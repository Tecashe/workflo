"use client";
import { Receipt } from 'lucide-react';
import BaseNode from '../BaseNode';

interface KraEtrNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    operation?: string;
    credentialId?: string;
}

export default function KraEtrNode({ data, id, selected }: {
    data: KraEtrNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.credentialId && !!data.operation;

    let defaultSubtitle = 'Configure KRA ETR';
    if (isConfigured) {
        if (data.operation === 'issue_receipt') defaultSubtitle = 'Issue Receipt';
    }

    const subtitle = data.subtitle || defaultSubtitle;

    return (
        <BaseNode
            id={id}
            selected={selected}
            nodeType="kraEtrNode"
            icon={<Receipt size={40} className="text-[#F04D26]" />}
            label={data.label || 'KRA eTIMS'}
            subtitle={subtitle}
            isConfigured={isConfigured}
        />
    );
}
