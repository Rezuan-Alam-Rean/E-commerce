import { NextRequest, NextResponse } from "next/server";
import { sendMetaServerEvent } from "@/lib/analytics/meta-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventName = typeof body.event_name === "string" ? body.event_name : "PageView";
    const eventId = typeof body.event_id === "string" ? body.event_id : undefined;
    const eventSourceUrl = typeof body.event_source_url === "string" ? body.event_source_url : undefined;
    const actionSource = typeof body.action_source === "string" ? body.action_source : "website";
    const customData = body.custom_data && typeof body.custom_data === "object" ? body.custom_data : undefined;
    const userData = body.user_data && typeof body.user_data === "object" ? body.user_data : undefined;

    const forwardedFor = request.headers.get("x-forwarded-for") ?? undefined;
    const clientIp = forwardedFor?.split(",")[0]?.trim() || undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const result = await sendMetaServerEvent({
      event_name: eventName,
      event_id: eventId,
      event_source_url: eventSourceUrl,
      action_source: actionSource,
      custom_data: customData,
      user_data: {
        ...userData,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, meta: result.response });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Invalid Meta event payload" },
      { status: 400 },
    );
  }
}
