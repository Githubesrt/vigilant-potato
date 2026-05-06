const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { id, img } = event.queryStringParameters;
    const userAgent = event.headers['user-agent'] || "";

    if (!id || !img) {
        return { statusCode: 400, body: "Missing Params" };
    }

    const webhookURL = `https://discord.com/api/webhooks/${id}`;

    // 1. Identify if the visitor is the Discord Bot or a real person
    const isDiscord = userAgent.includes("Discordbot");

    // 2. Prepare the notification for your Discord Channel
    const logData = {
        username: "Link Monitor",
        embeds: [{
            title: isDiscord ? "🔍 Discord Previewing Link" : "🚩 Real User Clicked!",
            color: isDiscord ? 3447003 : 15158332,
            fields: [
                { name: "Image Link", value: img },
                { name: "Device/Bot Info", value: userAgent }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    // Send to Webhook
    try {
        await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
    } catch (e) { console.error(e); }

    // 3. THE "MAGIC" FOR THE PREVIEW
    if (isDiscord) {
        // We serve HTML with Meta Tags so Discord shows the big image
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `
                <html>
                    <head>
                        <meta property="og:title" content="Image Preview">
                        <meta property="og:image" content="${img}">
                        <meta name="twitter:card" content="summary_large_image">
                    </head>
                    <body></body>
                </html>`
        };
    }

    // 4. THE REDIRECT FOR REAL USERS
    return {
        statusCode: 302,
        headers: { "Location": img },
        body: ""
    };
};
