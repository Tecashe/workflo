import type { WorkflowTemplate } from "../types";

export const LOCAL_BUSINESS_TEMPLATES: Partial<WorkflowTemplate>[] = [
    /**
     * Template 1 — Restaurant / Food Stall
     * Daily end-of-day: builds a sales summary using a Transform node,
     * posts a WhatsApp message to the business owner, and sends an SMS
     * receipt total to the manager via Africa's Talking.
     */
    {
        id: "restaurant-daily-sales-summary",
        name: "Daily Sales Summary & Owner Alert",
        description:
            "Every evening, compile the day's sales total, send the owner a WhatsApp summary, and ping the manager via SMS — all automatically.",
        category: "business",
        difficulty: "beginner",
        estimatedSetupMinutes: 6,
        tags: ["cron", "whatsapp", "africastalking", "sms", "sales", "restaurant", "daily"],
        availableTriggerId: "manual",
        highlights: [
            "Scheduled end-of-day trigger",
            "Auto-built sales summary",
            "WhatsApp alert to owner",
            "SMS to manager via Africa's Talking",
        ],
        requiredCredentials: [],
        setupMode: "credential_only",
        templateVersion: 1,
        requiredBindings: [
            {
                platform: "whatsapp" as never,
                nodeIds: ["dss-whatsapp"],
                description: "WhatsApp Business API credential (Access Token, Phone Number ID)",
            },
            {
                platform: "africastalking" as never,
                nodeIds: ["dss-sms"],
                description: "Africa's Talking credential (API Key, Username)",
            },
        ],
        fieldRequirements: [
            {
                nodeId: "dss-whatsapp",
                field: "to",
                label: "Owner's WhatsApp Number",
                placeholder: "254712345678",
                type: "text",
                required: true,
            },
            {
                nodeId: "dss-sms",
                field: "to",
                label: "Manager's Phone Number",
                placeholder: "+254723456789",
                type: "text",
                required: true,
            },
            {
                nodeId: "dss-transform",
                field: "expression",
                label: "Business Name",
                placeholder: "Mama Jane's Kitchen",
                type: "text",
                required: false,
            },
        ],
        nodes: [
            {
                id: "dss-cron",
                type: "cronTrigger",
                position: { x: 80, y: 260 },
                data: {
                    label: "6 PM Daily Close",
                    nodeType: "cronTrigger",
                    isConfigured: true,
                    schedule: "daily",
                    hour: 18,
                    minute: 0,
                    timezone: "Africa/Nairobi",
                },
            },
            {
                id: "dss-transform",
                type: "transformNode",
                position: { x: 320, y: 260 },
                data: {
                    label: "Build Sales Report",
                    nodeType: "transformNode",
                    isConfigured: true,
                    responseName: "salesSummary",
                    expression:
                        '{"business":"My Restaurant","date":"{dss-cron.triggeredAt}","totalSales":"KES 18,450","transactions":47,"topItem":"Grilled Chicken","mpesaReceipts":39,"cashReceipts":8}',
                },
            },
            {
                id: "dss-whatsapp",
                type: "whatsappNode",
                position: { x: 560, y: 180 },
                data: {
                    label: "WhatsApp → Owner",
                    nodeType: "whatsappNode",
                    isConfigured: false,
                    responseName: "waOwner",
                    credentialId: "",
                    messageType: "text",
                    to: "",
                    message:
                        "📊 *Daily Sales Report — {salesSummary.data.business}*\n\n🗓 Date: {salesSummary.data.date}\n💰 Total Sales: {salesSummary.data.totalSales}\n🧾 Transactions: {salesSummary.data.transactions}\n🏆 Top Item: {salesSummary.data.topItem}\n📲 M-Pesa: {salesSummary.data.mpesaReceipts} | 💵 Cash: {salesSummary.data.cashReceipts}\n\nHave a great evening!",
                },
            },
            {
                id: "dss-sms",
                type: "africastalkingNode",
                position: { x: 560, y: 340 },
                data: {
                    label: "SMS → Manager",
                    nodeType: "africastalkingNode",
                    isConfigured: false,
                    responseName: "smsManager",
                    credentialId: "",
                    operation: "send_sms",
                    to: "",
                    message:
                        "EOD Report: {salesSummary.data.totalSales} from {salesSummary.data.transactions} sales. Top: {salesSummary.data.topItem}. Check WhatsApp for details.",
                },
            },
            {
                id: "dss-log",
                type: "logNode",
                position: { x: 800, y: 260 },
                data: {
                    label: "Log Close",
                    nodeType: "logNode",
                    isConfigured: true,
                    level: "info",
                    message: "Daily close complete. Sales: {salesSummary.data.totalSales}",
                },
            },
        ],
        edges: [
            { id: "e1", source: "dss-cron", target: "dss-transform" },
            { id: "e2", source: "dss-transform", target: "dss-whatsapp" },
            { id: "e3", source: "dss-transform", target: "dss-sms" },
            { id: "e4", source: "dss-whatsapp", target: "dss-log" },
        ],
    },

    /**
     * Template 2 — Hardware Store / Butchery / Duka
     * Webhook-triggered order intake: customer sends order details,
     * workflow creates an M-Pesa STK push for payment, and sends a
     * WhatsApp confirmation with an AI-generated order receipt summary.
     */
    {
        id: "order-mpesa-whatsapp-receipt",
        name: "Customer Order → M-Pesa Request → WhatsApp Receipt",
        description:
            "When a customer places an order (via webhook or manual entry), automatically send an M-Pesa payment request, then deliver a formatted WhatsApp receipt with an AI-written summary.",
        category: "business",
        difficulty: "intermediate",
        estimatedSetupMinutes: 10,
        tags: ["webhook", "mpesa", "whatsapp", "openai", "receipt", "orders", "hardware", "butchery"],
        availableTriggerId: "webhook",
        highlights: [
            "Webhook-triggered from any order source",
            "M-Pesa STK Push to customer",
            "AI-generated friendly receipt message",
            "WhatsApp delivery to customer's phone",
        ],
        requiredCredentials: ["openai"],
        setupMode: "credential_only",
        templateVersion: 1,
        requiredBindings: [
            {
                platform: "openai",
                nodeIds: ["or-ai"],
                description: "OpenAI credential — used to write the friendly receipt message",
            },
            {
                platform: "mpesa" as never,
                nodeIds: ["or-mpesa"],
                description: "M-Pesa Daraja API credential (Consumer Key, Secret, Shortcode, Passkey)",
            },
            {
                platform: "whatsapp" as never,
                nodeIds: ["or-whatsapp"],
                description: "WhatsApp Business API credential (Access Token, Phone Number ID)",
            },
        ],
        fieldRequirements: [
            {
                nodeId: "or-mpesa",
                field: "phoneNumber",
                label: "Customer Phone (M-Pesa)",
                placeholder: "0712345678",
                type: "text",
                required: true,
            },
            {
                nodeId: "or-mpesa",
                field: "amount",
                label: "Order Total (KES)",
                placeholder: "1200",
                type: "text",
                required: true,
            },
            {
                nodeId: "or-whatsapp",
                field: "to",
                label: "Customer WhatsApp Number",
                placeholder: "254712345678",
                type: "text",
                required: true,
            },
            {
                nodeId: "or-ai",
                field: "model",
                label: "OpenAI Model",
                placeholder: "gpt-5-mini",
                type: "select",
                required: true,
                options: [
                    { value: "gpt-5-mini", label: "GPT-5 Mini (Recommended)" },
                    { value: "gpt-5", label: "GPT-5" },
                    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
                ],
                defaultValue: "gpt-5-mini",
            },
        ],
        nodes: [
            {
                id: "or-webhook",
                type: "webhookTrigger",
                position: { x: 80, y: 260 },
                data: {
                    label: "New Order",
                    nodeType: "webhookTrigger",
                    isConfigured: true,
                    responseName: "orderPayload",
                },
            },
            {
                id: "or-transform",
                type: "transformNode",
                position: { x: 320, y: 260 },
                data: {
                    label: "Build Order Context",
                    nodeType: "transformNode",
                    isConfigured: true,
                    responseName: "orderCtx",
                    expression:
                        '{"items":"{or-webhook.body.items}","customer":"{or-webhook.body.customerName}","phone":"{or-webhook.body.phone}","total":"{or-webhook.body.total}","shop":"My Shop","orderId":"ORD-{or-webhook.body.orderId}"}',
                },
            },
            {
                id: "or-mpesa",
                type: "mpesaNode",
                position: { x: 560, y: 180 },
                data: {
                    label: "Request M-Pesa Payment",
                    nodeType: "mpesaNode",
                    isConfigured: false,
                    responseName: "mpesaRes",
                    credentialId: "",
                    operation: "stk_push",
                    phoneNumber: "",
                    amount: "",
                    accountReference: "{orderCtx.data.orderId}",
                    transactionDesc: "Order payment — {orderCtx.data.shop}",
                },
            },
            {
                id: "or-ai",
                type: "openaiNode",
                position: { x: 560, y: 340 },
                data: {
                    label: "Generate Receipt Text",
                    nodeType: "openaiNode",
                    isConfigured: false,
                    responseName: "receiptText",
                    credentialId: "",
                    model: "",
                    systemPrompt:
                        "You write short, friendly, professional WhatsApp receipt messages for a small retail shop. Max 5 lines. Use emojis. Include order ID, items, total, and payment note.",
                    prompt:
                        "Write a WhatsApp receipt for:\nShop: {orderCtx.data.shop}\nCustomer: {orderCtx.data.customer}\nOrder ID: {orderCtx.data.orderId}\nItems: {orderCtx.data.items}\nTotal: KES {orderCtx.data.total}\nM-Pesa STK sent. Ref: {mpesaRes.data.checkoutRequestId}",
                    temperature: 0.4,
                },
            },
            {
                id: "or-whatsapp",
                type: "whatsappNode",
                position: { x: 820, y: 260 },
                data: {
                    label: "Send WhatsApp Receipt",
                    nodeType: "whatsappNode",
                    isConfigured: false,
                    responseName: "waReceipt",
                    credentialId: "",
                    messageType: "text",
                    to: "",
                    message: "{receiptText.data}",
                },
            },
            {
                id: "or-log",
                type: "logNode",
                position: { x: 1060, y: 260 },
                data: {
                    label: "Log Order",
                    nodeType: "logNode",
                    isConfigured: true,
                    level: "info",
                    message: "Order {orderCtx.data.orderId} processed. M-Pesa ref: {mpesaRes.data.checkoutRequestId}",
                },
            },
        ],
        edges: [
            { id: "e1", source: "or-webhook", target: "or-transform" },
            { id: "e2", source: "or-transform", target: "or-mpesa" },
            { id: "e3", source: "or-transform", target: "or-ai" },
            { id: "e4", source: "or-ai", target: "or-whatsapp" },
            { id: "e5", source: "or-mpesa", target: "or-whatsapp" },
            { id: "e6", source: "or-whatsapp", target: "or-log" },
        ],
    },

    /**
     * Template 3 — Any shop with stock / butchery / hardware / pharmacy
     * Morning low-stock alert: runs daily at 7 AM, checks a predefined
     * stock list via Transform, flags items below threshold using Condition,
     * and sends an SMS reorder alert to the supplier via Africa's Talking,
     * plus a WhatsApp summary to the shop owner.
     */
    {
        id: "low-stock-reorder-alert",
        name: "Low Stock → SMS Supplier + WhatsApp Owner Alert",
        description:
            "Every morning, check your stock levels, automatically alert your supplier by SMS for items running low, and WhatsApp your shop owner a quick stock overview — before the first customer walks in.",
        category: "business",
        difficulty: "beginner",
        estimatedSetupMinutes: 7,
        tags: ["cron", "condition", "africastalking", "whatsapp", "stock", "inventory", "butchery", "hardware", "shop"],
        availableTriggerId: "manual",
        highlights: [
            "7 AM daily stock check",
            "Condition node routes low vs. OK stock",
            "SMS alert to supplier for reorder",
            "WhatsApp owner morning briefing",
        ],
        requiredCredentials: [],
        setupMode: "credential_only",
        templateVersion: 1,
        requiredBindings: [
            {
                platform: "africastalking" as never,
                nodeIds: ["ls-sms"],
                description: "Africa's Talking credential for supplier SMS",
            },
            {
                platform: "whatsapp" as never,
                nodeIds: ["ls-whatsapp"],
                description: "WhatsApp Business API credential for owner briefing",
            },
        ],
        fieldRequirements: [
            {
                nodeId: "ls-sms",
                field: "to",
                label: "Supplier's Phone Number",
                placeholder: "+254701234567",
                type: "text",
                required: true,
            },
            {
                nodeId: "ls-whatsapp",
                field: "to",
                label: "Owner's WhatsApp Number",
                placeholder: "254712345678",
                type: "text",
                required: true,
            },
            {
                nodeId: "ls-transform",
                field: "expression",
                label: "Shop Name",
                placeholder: "Kamau Hardware",
                type: "text",
                required: false,
            },
        ],
        nodes: [
            {
                id: "ls-cron",
                type: "cronTrigger",
                position: { x: 80, y: 260 },
                data: {
                    label: "7 AM Stock Check",
                    nodeType: "cronTrigger",
                    isConfigured: true,
                    schedule: "daily",
                    hour: 7,
                    minute: 0,
                    timezone: "Africa/Nairobi",
                },
            },
            {
                id: "ls-transform",
                type: "transformNode",
                position: { x: 320, y: 260 },
                data: {
                    label: "Load Stock Snapshot",
                    nodeType: "transformNode",
                    isConfigured: true,
                    responseName: "stock",
                    expression:
                        '{"shop":"My Shop","date":"{ls-cron.triggeredAt}","lowItems":[{"item":"Beef Ribs","qty":3,"threshold":10},{"item":"Cooking Oil 5L","qty":1,"threshold":5}],"okItems":[{"item":"Salt 2kg","qty":40},{"item":"Sugar 1kg","qty":28}],"lowCount":2,"status":"LOW"}',
                },
            },
            {
                id: "ls-condition",
                type: "conditionNode",
                position: { x: 560, y: 260 },
                data: {
                    label: "Any Low Stock?",
                    nodeType: "conditionNode",
                    isConfigured: true,
                    expression: "{stock.data.status}",
                    routes: ["LOW", "OK"],
                    defaultRoute: "OK",
                    rulesJson: '[{"route":"LOW","operator":"equals","value":"LOW"}]',
                    responseName: "stockRoute",
                },
            },
            {
                id: "ls-sms",
                type: "africastalkingNode",
                position: { x: 820, y: 180 },
                data: {
                    label: "SMS → Supplier",
                    nodeType: "africastalkingNode",
                    isConfigured: false,
                    responseName: "smsResult",
                    credentialId: "",
                    operation: "send_sms",
                    to: "",
                    message:
                        "REORDER ALERT — {stock.data.shop}: Low stock detected on {stock.data.lowCount} item(s). Please deliver urgently: {stock.data.lowItems[0].item} (Qty: {stock.data.lowItems[0].qty}), {stock.data.lowItems[1].item} (Qty: {stock.data.lowItems[1].qty}). Thank you.",
                },
            },
            {
                id: "ls-whatsapp",
                type: "whatsappNode",
                position: { x: 820, y: 320 },
                data: {
                    label: "WhatsApp → Owner",
                    nodeType: "whatsappNode",
                    isConfigured: false,
                    responseName: "waOwner",
                    credentialId: "",
                    messageType: "text",
                    to: "",
                    message:
                        "🏪 *{stock.data.shop} — Morning Stock Alert*\n\n⚠️ *Low Stock ({stock.data.lowCount} items):*\n• {stock.data.lowItems[0].item} — only {stock.data.lowItems[0].qty} left\n• {stock.data.lowItems[1].item} — only {stock.data.lowItems[1].qty} left\n\n✅ *Well Stocked:* {stock.data.okItems[0].item}, {stock.data.okItems[1].item}\n\n📲 Supplier SMS sent. Have a great day!",
                },
            },
            {
                id: "ls-log-ok",
                type: "logNode",
                position: { x: 820, y: 460 },
                data: {
                    label: "Log — Stock OK",
                    nodeType: "logNode",
                    isConfigured: true,
                    level: "info",
                    message: "Stock check passed — no low items detected.",
                },
            },
        ],
        edges: [
            { id: "e1", source: "ls-cron", target: "ls-transform" },
            { id: "e2", source: "ls-transform", target: "ls-condition" },
            { id: "e3", source: "ls-condition", sourceHandle: "LOW", target: "ls-sms" },
            { id: "e4", source: "ls-condition", sourceHandle: "LOW", target: "ls-whatsapp" },
            { id: "e5", source: "ls-condition", sourceHandle: "OK", target: "ls-log-ok" },
        ],
    },
];
