export interface Env {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  ALLOWED_ORIGIN: string;
  NOTIFY_TO_EMAIL: string;
  FROM_EMAIL: string;
  COUPONS_JSON?: string;
  DB?: D1Database;
}

type CouponShape = {
  [code: string]: {
    type: "percent" | "flat";
    value: number;
    maxDiscount?: number;
    minAmount?: number;
    active?: boolean;
  };
};

const json = (data: unknown, status = 200, origin = "*") =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

const parseJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return {};
  }
};

const toPaise = (rupees: number) => Math.round(rupees * 100);
const fromPaise = (paise: number) => Math.round(paise / 100);

function getCoupons(env: Env): CouponShape {
  if (!env.COUPONS_JSON) return {};
  try {
    return JSON.parse(env.COUPONS_JSON);
  } catch {
    return {};
  }
}

function applyCoupon(amount: number, code: string, env: Env) {
  if (!code) return { discountAmount: 0, finalAmount: amount, applied: false };
  const coupons = getCoupons(env);
  const c = coupons[code.toUpperCase()];
  if (!c || c.active === false) throw new Error("Invalid or inactive coupon.");
  if (c.minAmount && amount < c.minAmount) throw new Error(`Minimum amount is INR ${c.minAmount}.`);

  let discount = 0;
  if (c.type === "percent") discount = Math.round((amount * c.value) / 100);
  if (c.type === "flat") discount = Math.round(c.value);
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.max(0, Math.min(discount, amount));
  return { discountAmount: discount, finalAmount: amount - discount, applied: true };
}

async function razorpayRequest(env: Env, path: string, payload: Record<string, unknown>) {
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description || "Razorpay API error.");
  return data;
}

async function hmacHex(secret: string, msg: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function maybeSave(env: Env, table: "leads" | "payments", payload: Record<string, unknown>) {
  if (!env.DB) return;
  const raw = JSON.stringify(payload);
  if (table === "leads") {
    await env.DB.prepare(
      "INSERT INTO leads (name,email,phone,message,source,raw_json,created_at) VALUES (?1,?2,?3,?4,?5,?6,datetime('now'))"
    )
      .bind(
        String(payload.name || ""),
        String(payload.email || ""),
        String(payload.phone || ""),
        String(payload.message || ""),
        String(payload.source || ""),
        raw
      )
      .run();
  } else {
    await env.DB.prepare(
      "INSERT INTO payments (order_id,payment_id,amount,plan,customer_name,customer_email,raw_json,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,datetime('now'))"
    )
      .bind(
        String(payload.orderId || ""),
        String(payload.paymentId || ""),
        Number(payload.amount || 0),
        String(payload.planTitle || ""),
        String(payload.customerName || ""),
        String(payload.customerEmail || ""),
        raw
      )
      .run();
  }
}

async function sendMail(env: Env, subject: string, bodyText: string) {
  const payload = {
    personalizations: [{ to: [{ email: env.NOTIFY_TO_EMAIL, name: "ClariVeda Team" }] }],
    from: { email: env.FROM_EMAIL, name: "ClariVeda Website" },
    subject,
    content: [{ type: "text/plain", value: bodyText }],
  };
  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname.endsWith("/api/coupon/validate")) {
        const body = (await parseJson(request)) as { amount?: number; code?: string };
        const amount = Number(body.amount || 0);
        if (!amount || amount < 1) throw new Error("Invalid amount.");
        const result = applyCoupon(amount, String(body.code || ""), env);
        return json(result, 200, origin);
      }

      if (request.method === "POST" && url.pathname.endsWith("/api/payment/create-order")) {
        const body = (await parseJson(request)) as {
          amount?: number;
          couponCode?: string;
          planTitle?: string;
          customer?: { name?: string; email?: string; phone?: string };
        };
        const baseAmount = Number(body.amount || 0);
        if (!baseAmount || baseAmount < 1) throw new Error("Invalid amount.");

        const coupon = applyCoupon(baseAmount, String(body.couponCode || ""), env);
        const finalAmount = coupon.finalAmount;

        const rz = await razorpayRequest(env, "orders", {
          amount: toPaise(finalAmount),
          currency: "INR",
          receipt: `clariveda_${Date.now()}`,
          notes: {
            planTitle: body.planTitle || "",
            couponCode: body.couponCode || "",
            customerName: body.customer?.name || "",
            customerEmail: body.customer?.email || "",
            customerPhone: body.customer?.phone || "",
          },
        });

        return json(
          {
            keyId: env.RAZORPAY_KEY_ID,
            orderId: rz.id,
            amountPaise: rz.amount,
            amount: finalAmount,
            discountAmount: coupon.discountAmount,
          },
          200,
          origin
        );
      }

      if (request.method === "POST" && url.pathname.endsWith("/api/payment/verify")) {
        const body = (await parseJson(request)) as {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };

        const data = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
        const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, data);
        const ok = expected === body.razorpay_signature;
        if (!ok) return json({ error: "Invalid payment signature." }, 400, origin);

        await maybeSave(env, "payments", {
          orderId: body.razorpay_order_id,
          paymentId: body.razorpay_payment_id,
        });
        return json({ verified: true }, 200, origin);
      }

      if (request.method === "POST" && url.pathname.endsWith("/api/contact")) {
        const body = (await parseJson(request)) as {
          name?: string;
          email?: string;
          phone?: string;
          message?: string;
          source?: string;
        };
        if (!body.name || !body.email || !body.phone) {
          return json({ error: "name, email and phone are required." }, 400, origin);
        }

        const msg = [
          `Name: ${body.name}`,
          `Email: ${body.email}`,
          `Phone: ${body.phone}`,
          `Source: ${body.source || "website"}`,
          "",
          `Message: ${body.message || "-"}`,
        ].join("\n");

        await sendMail(env, `New ClariVeda Lead (${body.source || "website"})`, msg);
        await maybeSave(env, "leads", {
          ...body,
        });
        return json({ ok: true }, 200, origin);
      }

      return json({ error: "Not found." }, 404, origin);
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : "Unexpected error." }, 500, origin);
    }
  },
};
