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

    console.log("Generišem sliku outfita za:", specs);

    const prompt = `Create a professional fashion outfit visualization for a person with these specifications:
- Height: ${specs.height}cm
- Weight: ${specs.weight}kg
- Style: ${specs.style}
- Favorite colors: ${specs.colors}

Generate a stylish, complete outfit that matches these preferences. Show clothing items arranged as they would be worn together - top, bottom, shoes, and accessories. Make it look like a fashion magazine layout. High quality, professional styling.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: prompt },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway greška:", response.status, errorText);
      throw new Error(`AI Gateway greška: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("Slika nije generisana");
    }

    console.log("Slika generisana uspešno");

    return new Response(
      JSON.stringify({ imageUrl }),
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