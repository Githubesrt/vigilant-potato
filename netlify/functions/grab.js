exports.handler = async (event, context) => {
    // Get the webhook ID and Image URL from the link
    const { id, img } = event.queryStringParameters;

    if (!id || !img) {
        return { statusCode: 400, body: "Missing parameters" };
    }

    const webhookURL = `https://discord.com/api/webhooks/${id}`;

    // The data to send to Discord
    const payload = {
        username: "Image Logger",
        embeds: [{
            title: "🚩 Link Clicked!",
            color: 15158332, 
            description: `A user viewed the image.`,
            fields: [
                { name: "Image URL", value: img },
                { name: "User-Agent", value: event.headers['user-agent'] || "Unknown" }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        // Fire the webhook
        await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error(err);
    }

    // Redirect the user to the real image immediately
    return {
        statusCode: 302,
        headers: {
            "Location": img,
            "Cache-Control": "no-cache"
        },
        body: ""
    };
};
