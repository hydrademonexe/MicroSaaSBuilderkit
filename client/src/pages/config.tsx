import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Settings, Upload, Image } from "lucide-react";

export default function ConfigPage() {
  const { toast } = useToast();
  const [cmvPercent, setCmvPercent] = useState<string>("");
  const [appName, setAppName] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cmvValue, appNameValue, logoUrlValue] = await Promise.all([
          database.getConfig("cmvEstimadoPercent"),
          database.getConfig("appName"),
          database.getConfig("logoUrl")
        ]);
        
        setCmvPercent(cmvValue != null ? String(cmvValue) : "35");
        setAppName(appNameValue || "SalgadosPro");
        setLogoUrl(logoUrlValue || "");
      } catch (e) {
        setCmvPercent("35");
        setAppName("SalgadosPro");
        setLogoUrl("");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const parsed = parseFloat(cmvPercent);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast({
        title: "Erro",
        description: "Informe um percentual entre 0 e 100",
        variant: "destructive"
      });
      return;
    }

    try {
      await Promise.all([
        database.setConfig("cmvEstimadoPercent", parsed),
        database.setConfig("appName", appName),
        database.setConfig("logoUrl", logoUrl)
      ]);
      toast({ title: "Sucesso!", description: "Configurações salvas" });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar", variant: "destructive" });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Settings className="text-primary" />
          Configurações
        </h1>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência do App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appName">Nome do App</Label>
              <Input
                id="appName"
                type="text"
                placeholder="SalgadosPro"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={loading}
                data-testid="input-app-name"
              />
            </div>
            
            <div>
              <Label htmlFor="logo">Logo/Avatar</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    data-testid="input-logo-upload"
                  />
                  <label htmlFor="logo">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Escolher Imagem
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cmv">CMV Estimado (%)</Label>
              <Input
                id="cmv"
                type="number"
                step="0.1"
                placeholder="35"
                value={cmvPercent}
                onChange={(e) => setCmvPercent(e.target.value)}
                disabled={loading}
                data-testid="input-cmv-percent"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave} 
          data-testid="button-save-config"
          className="w-full"
        >
          Salvar Configurações
        </Button>
      </div>
    </Layout>
  );
}


