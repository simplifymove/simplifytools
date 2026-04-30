import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Configure nodemailer transporter
    // Using Gmail with app password or your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content to admin
    const adminMailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: 'info@simplifyconvert.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-bottom: 24px; border-bottom: 2px solid #f97316; padding-bottom: 12px;">New Contact Form Submission</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 16px;">
            <p style="margin: 0 0 16px 0;">
              <strong style="color: #374151;">Name:</strong><br/>
              <span style="color: #6b7280;">${name}</span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <strong style="color: #374151;">Email:</strong><br/>
              <span style="color: #6b7280;"><a href="mailto:${email}">${email}</a></span>
            </p>
            
            <p style="margin: 0 0 16px 0;">
              <strong style="color: #374151;">Subject:</strong><br/>
              <span style="color: #6b7280;">${subject}</span>
            </p>
            
            <p style="margin: 0;">
              <strong style="color: #374151;">Message:</strong><br/>
              <span style="color: #6b7280; white-space: pre-wrap; line-height: 1.6;">${message}</span>
            </p>
          </div>
          
          <div style="color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p>This is an automated email from SimplifyConvert contact form. Please reply to ${email} to respond to this inquiry.</p>
          </div>
        </div>
      `,
    };

    // Email content to user (confirmation)
    const userMailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'We received your message - SimplifyConvert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background-color: #f97316; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 24px;">SC</div>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 16px; text-align: center;">Thank You for Contacting SimplifyConvert</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 16px;">
            <p style="color: #6b7280; margin-bottom: 16px;">Hi ${name},</p>
            
            <p style="color: #6b7280; margin-bottom: 16px; line-height: 1.6;">
              Thank you for reaching out to us! We've received your message and appreciate you taking the time to contact SimplifyConvert.
            </p>
            
            <p style="color: #6b7280; margin-bottom: 16px; line-height: 1.6;">
              Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                <strong>Your message details:</strong><br/>
                Subject: ${subject}
              </p>
            </div>
            
            <p style="color: #6b7280; margin-bottom: 16px; line-height: 1.6;">
              If you have any urgent matters, feel free to reach out directly to our team at info@simplifyconvert.com.
            </p>
            
            <p style="color: #6b7280;">Best regards,<br/><strong>SimplifyConvert Team</strong></p>
          </div>
          
          <div style="color: #9ca3af; font-size: 12px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <p style="margin: 0;">© SimplifyConvert. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
