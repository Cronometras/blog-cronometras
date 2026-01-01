require('dotenv').config();
const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const toEmail = process.env.EMAIL_RECIPIENT || 'info@cronometras.com';

console.log('Testing Resend...');
console.log('API Key present:', !!apiKey);
if (apiKey) {
    console.log('API Key starts with:', apiKey.substring(0, 7));
}
console.log('From:', fromEmail);
console.log('To:', toEmail);

const resend = new Resend(apiKey);

resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: 'Test Email from script',
    html: '<p>This is a test email to verify Resend configuration.</p>'
})
    .then(data => {
        console.log('Success!', data);
    })
    .catch(err => {
        console.error('Error!', err);
    });
