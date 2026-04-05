import { corsHeaders } from '@supabase/supabase-js/cors'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const GetSlotsSchema = z.object({ action: z.literal('get-slots') })

const BookSchema = z.object({
  action: z.literal('book'),
  name: z.string().min(1).max(200),
  business: z.string().min(1).max(200),
  needs: z.string().min(1).max(2000),
  tier: z.string().max(200).optional(),
  slotStart: z.string(),
  slotEnd: z.string(),
})

const ActionSchema = z.discriminatedUnion('action', [GetSlotsSchema, BookSchema])

async function getAccessToken(serviceAccountKey: any): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const claimSet = btoa(JSON.stringify({
    iss: serviceAccountKey.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))

  const signInput = `${header}.${claimSet}`

  // Import the private key
  const pemContents = serviceAccountKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signInput)
  )

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${header.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.${claimSet.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.${base64Signature}`

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenResp.json()
  if (!tokenResp.ok) throw new Error(`Token error: ${JSON.stringify(tokenData)}`)
  return tokenData.access_token
}

function getNext7Days(): { start: string; end: string } {
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  return { start: now.toISOString(), end: end.toISOString() }
}

function generateSlots(busyPeriods: { start: string; end: string }[]): any[] {
  const days: any[] = []
  const now = new Date()

  for (let d = 0; d < 7; d++) {
    const date = new Date(now)
    date.setDate(date.getDate() + d)

    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends

    const dateStr = date.toISOString().split('T')[0]
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    const slots: any[] = []
    // Generate 30-min slots from 9:00 to 17:00
    for (let hour = 9; hour < 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = new Date(date)
        slotStart.setHours(hour, min, 0, 0)
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + 30)

        if (slotStart < now) continue

        const isBusy = busyPeriods.some(bp => {
          const bpStart = new Date(bp.start)
          const bpEnd = new Date(bp.end)
          return slotStart < bpEnd && slotEnd > bpStart
        })

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            display: slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Zurich' }),
          })
        }
      }
    }

    if (slots.length > 0) {
      days.push({ date: dateStr, label: dayLabel, slots })
    }
  }

  return days
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: 'Google Calendar not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID')
    if (!calendarId) {
      return new Response(JSON.stringify({ error: 'Calendar ID not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const parsed = ActionSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const serviceAccountKey = JSON.parse(serviceAccountJson)
    const accessToken = await getAccessToken(serviceAccountKey)

    if (parsed.data.action === 'get-slots') {
      const { start, end } = getNext7Days()

      const freeBusyResp = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: start,
          timeMax: end,
          items: [{ id: calendarId }],
        }),
      })

      const freeBusyData = await freeBusyResp.json()
      if (!freeBusyResp.ok) throw new Error(`FreeBusy error: ${JSON.stringify(freeBusyData)}`)

      const busyPeriods = freeBusyData.calendars?.[calendarId]?.busy || []
      const days = generateSlots(busyPeriods)

      return new Response(JSON.stringify({ days }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (parsed.data.action === 'book') {
      const { name, business, needs, tier, slotStart, slotEnd } = parsed.data

      const event = {
        summary: `Consultation: ${name} — ${business}`,
        description: `Name: ${name}\nBusiness: ${business}\nNeeds: ${needs}\n${tier ? `Selected Tier: ${tier}` : ''}`,
        start: { dateTime: slotStart, timeZone: 'Europe/Zurich' },
        end: { dateTime: slotEnd, timeZone: 'Europe/Zurich' },
      }

      const eventResp = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      const eventData = await eventResp.json()
      if (!eventResp.ok) throw new Error(`Event creation error: ${JSON.stringify(eventData)}`)

      return new Response(JSON.stringify({ success: true, eventId: eventData.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
