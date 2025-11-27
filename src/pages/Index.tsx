import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserSpecs {
  height: string;
  weight: string;
  style: string;
  colors: string;
}

const Index = () => {
  const { toast } = useToast();
  const [specs, setSpecs] = useState<UserSpecs>({
    height: "",
    weight: "",
    style: "",
    colors: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const [outfitImage, setOutfitImage] = useState("");

  const handleGenerate = async () => {
    if (!specs.height || !specs.weight || !specs.style || !specs.colors) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva polja",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setRecommendations("");
    setOutfitImage("");

    try {
      // Generišemo tekstualne preporuke
      const { data: recData, error: recError } = await supabase.functions.invoke(
        "generate-outfit-recommendations",
        {
          body: { specs },
        }
      );

      if (recError) throw recError;
      setRecommendations(recData.recommendations);

      // Generišemo sliku outfita
      const { data: imgData, error: imgError } = await supabase.functions.invoke(
        "generate-outfit-image",
        {
          body: { specs },
        }
      );

      if (imgError) throw imgError;
      setOutfitImage(imgData.imageUrl);

      toast({
        title: "Uspešno!",
        description: "Outfit je generisan",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent gradient-primary">
            AI Outfit Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Personalizovani outfiti kreirani samo za vas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Leva strana - Specifikacije i Virtuelna Lutka */}
          <div className="space-y-6">
            <Card className="p-6 shadow-elegant">
              <h2 className="text-2xl font-serif font-semibold mb-6">
                Vaše specifikacije
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="height">Visina (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={specs.height}
                    onChange={(e) =>
                      setSpecs({ ...specs, height: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Težina (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={specs.weight}
                    onChange={(e) =>
                      setSpecs({ ...specs, weight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="style">Stil (casual, formal, sportski...)</Label>
                  <Input
                    id="style"
                    placeholder="casual"
                    value={specs.style}
                    onChange={(e) =>
                      setSpecs({ ...specs, style: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="colors">Omiljene boje</Label>
                  <Input
                    id="colors"
                    placeholder="plava, crna, bela"
                    value={specs.colors}
                    onChange={(e) =>
                      setSpecs({ ...specs, colors: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Virtuelna Lutka */}
            <Card className="p-6 shadow-elegant">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                Vaš Avatar
              </h2>
              <div className="aspect-[3/4] bg-gradient-warm rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-16 h-16 text-muted-foreground"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {specs.height && specs.weight
                      ? `${specs.height}cm / ${specs.weight}kg`
                      : "Unesite vaše mere"}
                  </p>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 text-lg shadow-elegant gradient-primary hover:opacity-90 transition-smooth"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generišem outfit...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generiši Outfit
                </>
              )}
            </Button>
          </div>

          {/* Desna strana - Rezultati */}
          <div className="space-y-6">
            {/* AI Preporuke */}
            <Card className="p-6 shadow-elegant">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                AI Preporuke
              </h2>
              {recommendations ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {recommendations}
                  </p>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Ovde će se pojaviti preporuke...
                </div>
              )}
            </Card>

            {/* AI Slika */}
            <Card className="p-6 shadow-elegant">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                Vaš Outfit
              </h2>
              {outfitImage ? (
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={outfitImage}
                    alt="Generated outfit"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-warm rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Ovde će se pojaviti slika outfita...
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;