"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface WeddingRSVPFormData {
  attending: "yes" | "no";
  guests: string;
  allergies: string;
  email: string;
}

export interface WeddingRSVPResult {
  success: boolean;
  error?: string;
}

export async function submitWeddingRSVP(
  formData: WeddingRSVPFormData
): Promise<WeddingRSVPResult> {
  const isAttending = formData.attending === "yes";
  const guestLine = formData.guests || "Unknown";
  const allergyLine =
    isAttending && formData.allergies
      ? `<p><strong>Dietary Notes:</strong> ${formData.allergies}</p>`
      : "";
  const emailLine = formData.email
    ? `<p><strong>Email:</strong> ${formData.email}</p>`
    : "";

  try {
    const status = isAttending ? "✅ Attending" : "❌ Not Attending";

    await resend.emails.send({
      from: "RSVP <onboarding@resend.dev>",
      to: "ethan0380@gmail.com",
      subject: `Wedding RSVP: ${guestLine} — ${isAttending ? "Attending" : "Not Attending"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="margin-bottom: 4px;">New Wedding RSVP</h2>
          <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Guest(s):</strong> ${guestLine}</p>
          ${emailLine}
          ${allergyLine}
          <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
          <p style="color: #999; font-size: 12px;">Wedding RSVP</p>
        </div>
      `,
    });

    return { success: true };
  } catch (emailError) {
    console.error("Failed to send wedding RSVP email:", emailError);
    return {
      success: false,
      error: "Failed to submit RSVP. Please try again.",
    };
  }
}
