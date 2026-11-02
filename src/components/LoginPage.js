'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const errorMap = {
    expired_token: 'Your link has expired. Please request a new one.',
    invalid_token: 'Invalid link. Please request a new one.',
    missing_token: 'No token found. Please request a new link.',
};

export default function LoginPage() {

    const params  = useSearchParams();
    const urlError = errorMap[params.get('error')] || '';

    const [email,   setEmail]   = useState('');
    const [role,   setRole]   = useState("customer");
    const [message, setMessage] = useState(urlError);
    const [isError, setIsError] = useState(!!urlError);
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        console.log("Sending:", { email, role });

        const res  = await fetch('/api/auth/send-verification', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email,role }),
        });
        const data = await res.json();

        setIsError(!res.ok);
        setMessage(data.message);
        setLoading(false);
        if (res.ok) setSent(true);
    };

    // ── "Check your email" state ──
    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
                    <div className="text-5xl mb-4">📬</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        We sent a sign-in link to<br />
                        <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                        Wrong email?{' '}
                        <button
                            onClick={() => { setSent(false); setMessage(''); }}
                            className="text-orange-700 font-semibold hover:underline">
                            Try again
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // ── Email form ──
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-10">

                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome</h1>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                    Enter your email and we will send you a sign-in link.<br />
                    No password needed — we will create your account automatically.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-700 hover:bg-orange-800 disabled:bg-orange-300 text-white text-sm font-semibold rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed">
                        {loading ? 'Sending...' : 'Send Sign-In Link'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}