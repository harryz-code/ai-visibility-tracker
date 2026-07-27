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
      slug.split("-")[0] ? capitalize(slug.split("-")[0]) : "Brand",
      "Financial Services",
    );

  const ratePct =
    report.perModel.length > 0
      ? (
          (report.perModel.reduce((s, m) => s + m.mentionRate, 0) /
            report.perModel.length) *
          100
        ).toFixed(1)
      : String(report.overallScore);

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
          background: "#16151F",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(74,44,224,0.55), transparent 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.03em",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2.5px solid #16151F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#16151F",
                  }}
                />
              </div>
            </div>
            AVT
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              lineHeight: 1.15,
              maxWidth: 820,
              letterSpacing: "-0.02em",
            }}
          >
            How often does AI recommend {report.brandName}?
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 500,
              lineHeight: 1,
              fontFamily: "monospace",
            }}
          >
            {ratePct}%
          </div>
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "monospace",
            }}
          >
            Share of answer · 4 engines · {report.categoryName}
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
