import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";

// ---------------------------------------------------------------------------
// POST /api/mpesa/callback/[userId]
//
// This is the auto-generated Safaricom IPN endpoint, unique per user.
// The URL is shown in the MpesaConfig form and the credentials page so users
// can simply copy-paste it into the Daraja portal — no manual setup needed.
//
// When a payment completes, Safaricom posts here. We store the result in the
// MpesaPayment table and (if configured) trigger any workflows subscribed
// to the mpesaTrigger event for this user.
// ---------------------------------------------------------------------------

interface SafaricomCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{ Name: string; Value?: string | number }>;
            };
        };
    };
}

function extractMetaItem(items: Array<{ Name: string; Value?: string | number }>, name: string): string | undefined {
    const item = items.find((i) => i.Name === name);
    return item?.Value !== undefined ? String(item.Value) : undefined;
}

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;

    if (!userId) {
        return NextResponse.json({ error: "Invalid callback URL" }, { status: 400 });
    }

    let body: SafaricomCallback;
    try {
        body = await req.json() as SafaricomCallback;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const callback = body?.Body?.stkCallback;
    if (!callback) {
        return NextResponse.json({ error: "Unexpected payload structure" }, { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
    const items = CallbackMetadata?.Item ?? [];

    const amount = extractMetaItem(items, "Amount");
    const mpesaReceiptNumber = extractMetaItem(items, "MpesaReceiptNumber");
    const phoneNumber = extractMetaItem(items, "PhoneNumber");
    const transactionDate = extractMetaItem(items, "TransactionDate");

    const status = ResultCode === 0 ? "success" : "failed";

    try {
        // Store the payment result so workflows can query it
        await prisma.mpesaPayment.upsert({
            where: { checkoutRequestId: CheckoutRequestID },
            create: {
                userId,
                merchantRequestId: MerchantRequestID,
                checkoutRequestId: CheckoutRequestID,
                status,
                resultCode: String(ResultCode),
                resultDesc: ResultDesc,
                amount: amount ? parseFloat(amount) : null,
                receiptNumber: mpesaReceiptNumber ?? null,
                phoneNumber: phoneNumber ?? null,
                transactionDate: transactionDate ?? null,
                rawPayload: JSON.stringify(body),
            },
            update: {
                status,
                resultCode: String(ResultCode),
                resultDesc: ResultDesc,
                amount: amount ? parseFloat(amount) : null,
                receiptNumber: mpesaReceiptNumber ?? null,
                phoneNumber: phoneNumber ?? null,
                transactionDate: transactionDate ?? null,
                rawPayload: JSON.stringify(body),
            },
        });
    } catch (err) {
        // Log but don't fail — Safaricom retries if we return non-200
        console.error("[mpesa/callback] DB write error:", err);
    }

    // Safaricom requires a 200 with { ResultCode: 0 }
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
