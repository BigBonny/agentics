# Email.js Setup Instructions

## 1. Create Email.js Account

1. Go to [Email.js](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Create Email Service

1. In Email.js dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection instructions:
   - For Gmail: Enable 2-factor authentication and use an App Password
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a new app password for Email.js

## 3. Create Email Template

1. Go to "Email Templates" in Email.js dashboard
2. Click "Create New Template"
3. Use this template structure:

**Template ID:** (copy the generated ID)
**Service ID:** (copy from your service)

### Template Content:
```
Subject: {{subject}}

From: {{firstName}} {{lastName}} ({{email}})

Message:
{{message}}

---
This email was sent from Agentics Révision contact form.
```

## 4. Get Your Public Key

1. Go to Account → API Keys in Email.js dashboard
2. Copy your Public Key

## 5. Update Environment Variables

Update your `.env.local` file with the actual values:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

## 6. Test the Contact Form

1. Restart your development server: `pnpm dev`
2. Go to the Contact section
3. Fill out the form and submit
4. Check your email (bigbonny481@gmail.com) for the message

## Notes

- The free Email.js plan allows 200 emails per month
- All emails will be sent to bigbonny481@gmail.com
- The form includes validation and loading states
- In mock mode, emails are logged to console instead of being sent

## Troubleshooting

**If emails don't send:**
1. Check your Email.js service connection
2. Verify your template variables match the code
3. Ensure your API keys are correctly set in `.env.local`
4. Check browser console for error messages

**For Gmail users:**
- Make sure 2-factor authentication is enabled
- Use an App Password, not your regular password
- Check your spam folder if emails don't arrive
