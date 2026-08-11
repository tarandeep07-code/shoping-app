import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return Response.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    const response =
      await client.transactionalEmails.sendTransacEmail({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME,
        },

        to: [
          {
            email: email,
            name: name || "User",
          },
        ],

        subject: "Brevo Test Email",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 30px;">
            <h1>Hello ${name || "User"}!</h1>

            <p>
              This is a test email sent from my Next.js application
              using Brevo.
            </p>

            <p>
              If you received this email, your Brevo integration
              is working correctly.
            </p>

            <hr />

            <p style="color: #777;">
              Sent from Next.js 🚀
            </p>
          </div>
        `,

        textContent: `
Hello ${name || "User"}!

This is a test email sent from my Next.js application using Brevo.

If you received this email, your Brevo integration is working correctly.
        `,
      });

    console.log("Brevo response:", response);

    return Response.json({
      success: true,
      message: "Email sent successfully",
      messageId: response.messageId,
    });
  } catch (error) {
    console.error("Brevo email error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}