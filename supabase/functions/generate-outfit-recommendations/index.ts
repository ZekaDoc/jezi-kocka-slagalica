import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY nije konfigurisan");
    }

    console.log("Generišem preporuke za:", specs);

    const systemPrompt = `Ti si AI fashion stilista specijalizovan za personalizovane outfit preporuke. 
Tvoj zadatak je da kreiraš detaljne i praktične preporuke za odeću na osnovu korisnikovih specifikacija.
Tvoj odgovor treba da bude na srpskom jeziku, profesionalan, ali prijateljski.`;

    const userPrompt = `Kreiraj personalizovane outfit preporuke za osobu sa sledećim specifikacijama:
- Visina: ${specs.height}cm
- Težina: ${specs.weight}kg
- Stil: ${specs.style}
- Omiljene boje: ${specs.colors}

Preporuči konkretne komade odeće (gornji i donji deo, obuću, dodatke) i objasni zašto bi ova kombinacija bila idealna za ovu osobu.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway greška:", response.status, errorText);
      throw new Error(`AI Gateway greška: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    console.log("Preporuke generisane uspešno");

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Greška:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Nepoznata greška" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});