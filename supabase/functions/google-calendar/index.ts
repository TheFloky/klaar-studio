const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const CAL_API_BASE = 'https://api.cal.com/v2'

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

async function getSettings(): Promise<{ apiKey: string; eventTypeId: string; calUsername: string }> {
  let apiKey = Deno.env.get('CAL_API_KEY') || ''
  let eventTypeId = Deno.env.get('CAL_EVENT_TYPE_ID') || ''
  let calUsername = Deno.env.get('CAL_USERNAME') || ''

  if (!apiKey || !eventTypeId || !calUsername) {
    const sbClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data: settings } = await sbClient
      .from('settings')
      .select('key, value')
      .in('key', ['CAL_API_KEY', 'CAL_EVENT_TYPE_ID', 'CAL_USERNAME'])

    settings?.forEach((s: any) => {
      if (s.key === 'CAL_API_KEY' && !apiKey) apiKey = s.value
      if (s.key === 'CAL_EVENT_TYPE_ID' && !eventTypeId) eventTypeId = s.value
      if (s.key === 'CAL_USERNAME' && !calUsername) calUsername = s.value
    })
  }

  if (!apiKey) throw new Error('Cal.com API key not configured. Add it in Admin → Settings.')
  if (!eventTypeId) throw new Error('Cal.com Event Type ID not configured. Add it in Admin → Settings.')
  if (!calUsername) throw new Error('Cal.com username not configured. Add it in Admin → Settings.')

  return { apiKey, eventTypeId, calUsername }
}

function formatSlotsResponse(slots: any[]): any[] {
  const dayMap: Record<string, { date: string; label: string; slots: any[] }> = {}

  for (const slot of slots) {
    const start = new Date(slot.time)
    const dateStr = start.toISOString().split('T')[0]

    if (!dayMap[dateStr]) {
      dayMap[dateStr] = {
        date: dateStr,
        label: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        slots: [],
      }
    }

    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)

    dayMap[dateStr].slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      display: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Zurich' }),
    })
  }

  return Object.values(dayMap)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const parsed = ActionSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { apiKey, eventTypeId, calUsername } = await getSettings()

    if (parsed.data.action === 'get-slots') {
      const now = new Date()
      const end = new Date(now)
      end.setDate(end.getDate() + 7)

      const startDate = now.toISOString().split('T')[0]
      const endDate = end.toISOString().split('T')[0]

      const url = `${CAL_API_BASE}/slots/available?startTime=${startDate}&endTime=${endDate}&eventTypeId=${eventTypeId}`

      const resp = await fetch(url, {
        headers: {
          'cal-api-version': '2024-09-04',
          Authorization: `Bearer ${apiKey}`,
        },
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(`Cal.com slots error: ${JSON.stringify(data)}`)

      // Cal.com v2 returns { data: { slots: { "YYYY-MM-DD": [...] } } }
      const slotsObj = data?.data?.slots || {}
      const allSlots: any[] = []
      for (const dateKey of Object.keys(slotsObj)) {
        for (const slot of slotsObj[dateKey]) {
          allSlots.push(slot)
        }
      }

      const days = formatSlotsResponse(allSlots)

      return new Response(JSON.stringify({ days }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (parsed.data.action === 'book') {
      const { name, business, needs, tier, slotStart } = parsed.data

      const bookResp = await fetch(`${CAL_API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'cal-api-version': '2024-08-13',
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: slotStart,
          eventTypeId: Number(eventTypeId),
          attendee: {
            name,
            email: `${business.toLowerCase().replace(/[^a-z0-9]/g, '')}@placeholder.com`,
            timeZone: 'Europe/Zurich',
          },
          metadata: {
            business,
            needs,
            tier: tier || '',
          },
        }),
      })

      const bookData = await bookResp.json()
      if (!bookResp.ok) throw new Error(`Cal.com booking error: ${JSON.stringify(bookData)}`)

      // Log to database
      const sbClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      await sbClient.from('bookings').insert({
        name,
        business,
        needs,
        tier: tier || null,
        slot_start: slotStart,
        slot_end: parsed.data.slotEnd,
        calendar_event_id: String(bookData?.data?.uid || bookData?.data?.id || ''),
        status: 'confirmed',
      })

      return new Response(JSON.stringify({ success: true }), {
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
