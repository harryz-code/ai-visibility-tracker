import { Resend } from "resend";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "AVT <reports@avt.dev>";
}

export type SendReportPdfEmailInput = {
  to: string;
  brandName: string;
  categoryName: string;
  overallScore: number;
  reportUrl: string;
};

/**
 * Emails the free-report link to the requester. Real PDF rendering is a
 * later phase — for now this sends the shareable report URL. No-ops (logs)
 * when RESEND_API_KEY is unset so fixture mode keeps working offline.
 */
export async function sendReportPdfEmail(
  input: SendReportPdfEmailInput,
): Promise<{ sent: boolean; id?: string }> {
  const resend = client();
  if (!resend) {
    console.log(`[resend stub] would email report to ${input.to}: ${input.reportUrl}`);
    return { sent: false };
  }

  const res = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: `${input.brandName} AI Visibility Report — score ${input.overallScore}`,
    html: `<p>Your AI visibility report for <strong>${input.brandName}</strong> in ${input.categoryName} is ready.</p>
<p>Overall score: <strong>${input.overallScore}</strong></p>
<p><a href="${input.reportUrl}">View the full report</a></p>`,
  });

  return { sent: true, id: res.data?.id };
}

export type SendDigestInput = {
  to: string;
  workspaceName: string;
  summary: string;
};

/**
 * Weekly digest email stub — wired for `digest/weekly` Inngest function.
 * No-ops (logs) when RESEND_API_KEY is unset.
 */
export async function sendDigest(
  input: SendDigestInput,
): Promise<{ sent: boolean; id?: string }> {
  const resend = client();
  if (!resend) {
    console.log(`[resend stub] would email weekly digest to ${input.to}: ${input.summary}`);
    return { sent: false };
  }

  const res = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: `Weekly AI visibility digest — ${input.workspaceName}`,
    html: `<p>${input.summary}</p>`,
  });

  return { sent: true, id: res.data?.id };
}
