// app/api/auth/send-verification/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { BrevoClient } from '@getbrevo/brevo';

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export async function POST(req) {

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
            { message: 'Please enter a valid email address.' },
            { status: 400 }
        );
    }

    // Generate JWT token — expires in 5 minutes
    const token = jwt.sign(
        { email, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );

    const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`;

    try {
        const response = await client.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME,
            },
            to: [{ email }],
            subject: 'Your sign-in link',
            htmlContent: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:30px;">
                    <h2 style="color:#1a1a1a;margin-bottom:8px;">Sign in to Your App</h2>
                    <p style="color:#555;line-height:1.6;">
                        Click the button below to sign in. If you don't have an account,
                        one will be created automatically.
                        This link expires in <strong>5 minutes</strong>.
                    </p>
                    <a href="${verifyLink}"
                       style="display:inline-block;background:#b45309;color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:bold;margin:24px 0;">
                        Sign In / Create Account
                    </a>
                    <p style="color:#999;font-size:12px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
            textContent: `
                Sign in to Your App

                Click the link below to sign in. This link expires in 5 minutes.

                ${verifyLink}   

                If you didn't request this, ignore this email.
            `,
        });

        console.log('Brevo response:', response);

        return NextResponse.json({
            message: 'Sign-in link sent! Check your inbox. Link expires in 5 minutes.',
        });

    } catch (error) {
        console.error('Brevo email error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to send email. Please try again.' },
            { status: 500 }
        );
    }
}