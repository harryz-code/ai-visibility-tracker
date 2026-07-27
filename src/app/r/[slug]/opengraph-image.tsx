import { ImageResponse } from "next/og";
import { buildReportPayload, getReportMemory, seedDemoReport } from "@/lib/report/build";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  seedDemoReport();
  const report =
    getReportMemory(slug) ??
    buildReportPayload(
      slug.split("-")[0] ? capitalize(slug.split("-")[0]) : "Affirm",
      "BNPL",
    );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #fafafa 0%, #e4e4e7 100%)",
          color: "#18181b",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 28, letterSpacing: 4, color: "#71717a" }}>
            AVT
          </div>
          <div style={{ fontSize: 56, fontWeight: 700 }}>
            {report.brandName}
          </div>
          <div style={{ fontSize: 28, color: "#52525b" }}>
            AI Visibility in {report.categoryName}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1 }}>
            {report.overallScore}
          </div>
          <div style={{ fontSize: 24, color: "#52525b", paddingBottom: 16 }}>
            Visibility score · Wilson 95% CIs
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
