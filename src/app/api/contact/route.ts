import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Mail server configuration missing.' }, { status: 500 });
    }

    const { fullName, email, businessName, location, whatsapp, message } = await req.json();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required biological data (Name, Email, or Message).' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Qicmart <onboarding@resend.dev>',
      to: ['baskaran.nr007@gmail.com'],
      subject: `NEW_LEAD: ${businessName || fullName} / Retail Empire Inquiry`,
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #09090b; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #1f1f23;">
          <h2 style="color: #6366f1; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; font-weight: 800;">
            / TRANSMISSION_RECEIVED
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #1f1f23;">
              <td style="padding: 15px 0; color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700;">COMMANDER_NAME</td>
              <td style="padding: 15px 0; font-weight: 600;">${fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1f1f23;">
              <td style="padding: 15px 0; color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700;">COMM_CHANNEL</td>
              <td style="padding: 15px 0; color: #6366f1; font-weight: 600;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1f1f23;">
              <td style="padding: 15px 0; color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700;">BUSINESS_NAME</td>
              <td style="padding: 15px 0;">${businessName || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1f1f23;">
              <td style="padding: 15px 0; color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700;">GEOGRAPHIC_COORD</td>
              <td style="padding: 15px 0;">${location || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1f1f23;">
              <td style="padding: 15px 0; color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700;">WHATSAPP_LINK</td>
              <td style="padding: 15px 0; color: #10b981; font-weight: 600;">${whatsapp || 'N/A'}</td>
            </tr>
          </table>

          <div style="margin-top: 40px; padding: 25px; background-color: #16161a; border-radius: 15px; border-left: 4px solid #6366f1;">
            <p style="color: #71717a; text-transform: uppercase; font-size: 11px; font-weight: 700; margin-bottom: 15px;">MESSAGE_PAYLOAD</p>
            <p style="line-height: 1.6; color: #e4e4e7;">${message}</p>
          </div>

          <div style="margin-top: 40px; font-size: 10px; color: #3f3f46; text-align: center; border-top: 1px solid #1f1f23; pt: 20px;">
            QICMART_GLOBAL / SECURE_PLANETARY_COMMERCE / MKXXVI
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email Transmission Failed:', error);
      return NextResponse.json({ error: error.message || 'Transmission Failed' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Transmission Successful', data });
  } catch (error: any) {
    console.error('Internal Server Breakdown:', error);
    return NextResponse.json({ error: error.message || 'System processing failure.' }, { status: 500 });
  }
}
