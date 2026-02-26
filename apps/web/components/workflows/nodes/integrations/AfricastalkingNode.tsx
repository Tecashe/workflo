"use strict";
"use client";

import { Smartphone } from 'lucide-react';
import BaseNode from '../BaseNode';

interface AfricastalkingNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    operation?: string;
    credentialId?: string;
}

export default function AfricastalkingNode({ data, id, selected }: {
    data: AfricastalkingNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.credentialId && !!data.operation;

    let defaultSubtitle = "Configure Africa's Talking";
    if (isConfigured) {
        if (data.operation === 'send_sms') defaultSubtitle = 'Send SMS';
        else if (data.operation === 'send_airtime') defaultSubtitle = 'Send Airtime';
    }

    const subtitle = data.subtitle || defaultSubtitle;

    return (
        <BaseNode
            id={id}
            selected={selected}
            nodeType="africastalkingNode"
            icon={<Smartphone size={40} className="text-[#F04D26]" />}
            label={data.label || "Africa's Talking"}
            subtitle={subtitle}
            isConfigured={isConfigured}
        />
    );
}
