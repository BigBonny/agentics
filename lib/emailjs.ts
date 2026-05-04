// import emailjs from '@emailjs/browser'

// Initialize EmailJS with your public key
// emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'mock_key')

export interface EmailData {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}

export const sendEmail = async (data: EmailData): Promise<boolean> => {
  try {
    // Check if we're in mock mode
    if (process.env.MOCK_MODE === 'true' || !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      console.log('Mock email send:', data)
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      return true
    }

    // Real EmailJS implementation (commented out for now)
    /*
    const templateParams = {
      to_name: 'Agentics Révision Team',
      from_name: `${data.firstName} ${data.lastName}`,
      from_email: data.email,
      subject: data.subject,
      message: data.message,
      to_email: 'bigbonny481@gmail.com'
    }

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams
    )

    return response.status === 200
    */

    // For now, always return true (mock success)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
