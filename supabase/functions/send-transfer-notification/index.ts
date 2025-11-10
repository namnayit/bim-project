// supabase/functions/send-transfer-notification/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const notificationEmailsRaw = Deno.env.get("NOTIFICATION_EMAILS") || "";
const notificationEmails = notificationEmailsRaw.includes(",")
  ? notificationEmailsRaw.split(",").map(email => email.trim())
  : [notificationEmailsRaw]; // Handles single or multiple emails

serve(async (req) => {
    // Set CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*", // Change to your frontend domain in production
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    };

    if (req.method === "OPTIONS") {
        // Handle CORS preflight requests
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { assetName, transferQuantity, sourceSiteName, targetSiteName } = await req.json();

        if (notificationEmails.length === 0) {
            return new Response(JSON.stringify({ error: "No notification emails configured" }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        const emailContent = {
            from: "site-manager@home-republic.co.uk",
            to: notificationEmails,
            subject: `Asset Transfer Notification: ${assetName}`,
            text: `An asset transfer has been completed:\n\nAsset: ${assetName}\nQuantity: ${transferQuantity}\nFrom Site: ${sourceSiteName}\nTo Site: ${targetSiteName}\n\nThank you!`,
        };

        console.log("Sending email notification:", emailContent);
        console.log("API Key:", resendApiKey);
        console.log("Notification Emails:", notificationEmails);

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailContent),
        });
        

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Resend API error:", errorText);
            return new Response(JSON.stringify({ error: `Failed to send email: ${errorText}` }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: corsHeaders,
        });
    } catch (error) {
        console.error("Error sending email notification:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});
