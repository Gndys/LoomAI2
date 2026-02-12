"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, Layers3, ScanLine, SlidersHorizontal, Sparkles, SwatchBook, X, Zap } from "lucide-react";
import { toast } from "sonner";

import { FeatureCard, FeaturePageShell } from "@/components/feature-page-shell";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/use-translation";
import { ImageUploader } from "../ai-generate/components/ImageUploader";
import { PromptEditor } from "../ai-generate/components/PromptEditor";
import { ResultDisplay } from "../ai-generate/components/ResultDisplay";
import {
  ageOptions,
  colorOptions,
  elementOptions,
  fabricOptions,
  fitOptions,
  genderOptions,
  generateRandomPrompt,
  modelOptions,
  sceneOptions,
  seasonOptions,
  sizeOptions,
  styleOptions,
  viewOptions,
} from "@libs/ai/prompt-engine";

const panelClass =
  "border-border/60 bg-card/50 shadow-[0_30px_80px_-60px_hsl(var(--primary)/0.25)] backdrop-blur-xl";

const visualToneClasses = [
  "from-chart-1/30 via-chart-2/10 to-background",
  "from-chart-2/30 via-chart-3/10 to-background",
  "from-chart-3/30 via-chart-4/10 to-background",
  "from-chart-4/30 via-chart-1/10 to-background",
];

const accentToneClasses = [
  "border-chart-1/30 bg-chart-1/10 text-chart-1",
  "border-chart-2/30 bg-chart-2/10 text-chart-2",
  "border-chart-3/30 bg-chart-3/10 text-chart-3",
  "border-chart-4/30 bg-chart-4/10 text-chart-4",
];

const capabilityIcons = [Layers3, ScanLine, SwatchBook, Sparkles, CheckCircle2, ArrowUpRight];

export default function LoomaiFeaturesPage() {
  const router = useRouter();
  const { t, locale: currentLocale } = useTranslation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);
  const [size, setSize] = useState("Auto");
  const [style, setStyle] = useState("none");
  const [colorScheme, setColorScheme] = useState("none");
  const [fabric, setFabric] = useState("none");
  const [view, setView] = useState("none");
  const [fit, setFit] = useState("none");
  const [element, setElement] = useState("none");
  const [targetGender, setTargetGender] = useState("none");
  const [targetAge, setTargetAge] = useState("none");
  const [targetScene, setTargetScene] = useState("none");
  const [targetSeason, setTargetSeason] = useState("none");
  const [model, setModel] = useState("loom-pro");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hintItems = t.aiGenerate.hints;
  const sizeLabels = t.aiGenerate.params.options?.size as Record<string, string> | undefined;
  const styleLabels = t.aiGenerate.params.options?.style as Record<string, string> | undefined;
  const colorLabels = t.aiGenerate.params.options?.color as Record<string, string> | undefined;
  const fabricLabels = t.aiGenerate.params.options?.fabric as Record<string, string> | undefined;
  const viewLabels = t.aiGenerate.params.options?.view as Record<string, string> | undefined;
  const fitLabels = t.aiGenerate.params.options?.fit as Record<string, string> | undefined;
  const elementLabels = t.aiGenerate.params.options?.element as Record<string, string> | undefined;
  const genderLabels = t.aiGenerate.params.options?.gender as Record<string, string> | undefined;
  const ageLabels = t.aiGenerate.params.options?.age as Record<string, string> | undefined;
  const sceneLabels = t.aiGenerate.params.options?.scene as Record<string, string> | undefined;
  const seasonLabels = t.aiGenerate.params.options?.season as Record<string, string> | undefined;
  const modelLabels = t.aiGenerate.params.options?.model as Record<string, string> | undefined;
  const canGenerate = Boolean(uploadedImage && prompt && !isGenerating);

  const handleImageUpload = (imageData: string) => {
    if (!imageData) {
      setUploadedImage(null);
      setGeneratedImage(null);
      return;
    }

    setUploadedImage(imageData);
    setGeneratedImage(null);
    toast.success(t.aiGenerate.toasts.uploadSuccess);
  };

  const handleClearUpload = () => {
    setUploadedImage(null);
    setGeneratedImage(null);
    toast.info(t.aiGenerate.toasts.clearedUpload);
  };

  const handleInlineFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t.aiGenerate.upload.fileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPrompt("");
    setNegativePrompt("");
    setShowNegative(false);
    setSize("Auto");
    setStyle("none");
    setColorScheme("none");
    setFabric("none");
    setView("none");
    setFit("none");
    setElement("none");
    setTargetGender("none");
    setTargetAge("none");
    setTargetScene("none");
    setTargetSeason("none");
    setGeneratedImage(null);
    toast.info(t.aiGenerate.toasts.clearedAll);
  };

  const handleRandom = () => {
    const randomPrompt = generateRandomPrompt();
    setPrompt(randomPrompt);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !prompt) {
      toast.error(t.aiGenerate.toasts.needUploadPrompt);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: uploadedImage,
          prompt,
          negativePrompt: showNegative ? negativePrompt : "",
          size,
          style,
          colorScheme,
          fabric,
          view,
          fit,
          element,
          targetGender,
          targetAge,
          targetScene,
          targetSeason,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Generate failed");
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      toast.success(t.aiGenerate.toasts.generateSuccess);
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(t.aiGenerate.toasts.generateFailed);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInCanvas = () => {
    if (!uploadedImage || !prompt) {
      toast.error(t.aiGenerate.toasts.needUploadPrompt);
      return;
    }

    try {
      sessionStorage.setItem(
        "loomai:canvas:seed",
        JSON.stringify({
          prompt,
          image: uploadedImage,
        })
      );
    } catch (error) {
      console.error("Failed to seed canvas state", error);
    }

    router.push(`/${currentLocale}/canvas`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.15),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--chart-3)/0.12),transparent_45%)]" />
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-chart-1/15 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-72 w-72 rounded-full bg-chart-3/15 blur-3xl" />

        <div className="container relative z-10 px-4 pb-20 pt-24 md:px-6 md:pb-24 md:pt-32">
          <motion.div
            className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center lg:text-left">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-chart-1" />
                {t.featuresPage.hero.badge}
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t.featuresPage.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {t.featuresPage.hero.subtitle}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {t.featuresPage.hero.promises.map((item: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground shadow-[0_14px_36px_-26px_rgba(15,23,42,0.35)]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg">
                  <Link href={`/${currentLocale}/canvas`}>{t.featuresPage.hero.buttons.primary}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-4 text-lg">
                  <Link href={`/${currentLocale}/upload`}>{t.featuresPage.hero.buttons.secondary}</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
                {t.featuresPage.hero.highlights.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/65 p-5 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="text-sm font-semibold text-foreground">LoomAI</div>
                <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Pipeline
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {t.featuresPage.stats.items.map((item: any, index: number) => (
                  <div key={index} className="rounded-2xl border border-border/60 bg-background/75 p-4">
                    <div className="text-2xl font-semibold text-foreground">
                      {item.value}
                      {item.suffix}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience */}
      <section>
        <FeaturePageShell
          title={t.featuresPage.experience.title}
          description={t.featuresPage.experience.subtitle}
          badge={{ icon: <Sparkles className="size-3.5" />, label: t.featuresPage.experience.badge }}
          className="max-w-5xl"
          titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground"
          descriptionClassName="text-sm sm:text-base text-muted-foreground"
          badgeClassName="border-border/60 bg-background/70 text-muted-foreground"
        >
          <div className="space-y-8">
            {!uploadedImage && (
              <FeatureCard className={panelClass}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {t.aiGenerate.preview.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t.aiGenerate.preview.description}
                        </p>
                      </div>
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-foreground/5 via-foreground/2 to-transparent">
                        <div className="absolute inset-0 grid grid-cols-2">
                          <div className="relative">
                            <div className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] text-foreground/80">
                              {t.aiGenerate.preview.before}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] text-foreground/80">
                              {t.aiGenerate.preview.after}
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 left-1/2 w-px bg-border/80" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="h-10 w-10 rounded-full border border-border/60 bg-muted/30 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                          {t.aiGenerate.preview.caption}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <ImageUploader
                        onUpload={handleImageUpload}
                        uploadedImage={uploadedImage}
                        variant="hero"
                        hints={hintItems}
                      />
                    </div>
                  </div>
                </CardContent>
              </FeatureCard>
            )}

            {uploadedImage && (
              <FeatureCard className={panelClass}>
                <CardContent className="pt-6">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.2)]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        {t.aiGenerate.prompt.title}
                      </div>
                      <div>
                        <input
                          id="inline-image-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleInlineFileInput}
                          className="hidden"
                        />
                        <label
                          htmlFor="inline-image-upload"
                          className="inline-flex cursor-pointer items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                        >
                          {t.aiGenerate.buttons.addImage}
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col lg:flex-row gap-4">
                      <div
                        className="relative shrink-0 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-muted/10 to-transparent overflow-hidden"
                        style={{ aspectRatio: "1 / 1", width: "160px", maxWidth: "200px" }}
                      >
                        <Image
                          src={uploadedImage}
                          alt="Uploaded"
                          fill
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleClearUpload}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground"
                          aria-label={t.aiGenerate.buttons.reupload}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <PromptEditor
                        prompt={prompt}
                        negativePrompt={negativePrompt}
                        showNegative={showNegative}
                        onPromptChange={setPrompt}
                        onNegativePromptChange={setNegativePrompt}
                      />
                    </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.sizePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {sizeLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.stylePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {styleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {styleLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.colorPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {colorLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={fabric} onValueChange={setFabric}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.fabricPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {fabricOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {fabricLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={view} onValueChange={setView}>
                      <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                        <SelectValue placeholder={t.aiGenerate.params.viewPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border/60 text-foreground">
                        {viewOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                            {viewLabels?.[option.value] ?? option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div
                      className="ml-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2 py-1 text-xs text-foreground/80"
                      aria-label={t.aiGenerate.params.advancedLabel}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    </div>
                  </div>

                  {showAdvanced && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {t.aiGenerate.params.advancedLabel}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Select value={fit} onValueChange={setFit}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.fitPlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {fitOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {fitLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={element} onValueChange={setElement}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.elementPlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {elementOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {elementLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={targetGender} onValueChange={setTargetGender}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.genderPlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {genderOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {genderLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={targetAge} onValueChange={setTargetAge}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.agePlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {ageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {ageLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={targetScene} onValueChange={setTargetScene}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.scenePlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {sceneOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {sceneLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={targetSeason} onValueChange={setTargetSeason}>
                          <SelectTrigger className="h-8 rounded-full border-border/60 bg-background/70 px-3 text-xs text-foreground/90">
                            <SelectValue placeholder={t.aiGenerate.params.seasonPlaceholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/60 text-foreground">
                            {seasonOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                                {seasonLabels?.[option.value] ?? option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-foreground/80">
                        <span>{t.aiGenerate.prompt.negativeLabel}</span>
                        <Switch checked={showNegative} onCheckedChange={setShowNegative} />
                      </div>

                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="h-8 rounded-md border-border/60 bg-background/60 px-3 text-xs text-foreground/80 hover:bg-muted/40">
                          <span className="text-xs text-foreground/80">模型：</span>
                          <SelectValue placeholder={t.aiGenerate.params.modelPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border/60 text-foreground">
                          {modelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="focus:bg-muted/40">
                              {modelLabels?.[option.value] ?? option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
                      >
                        {t.aiGenerate.prompt.clear}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRandom}
                        className="h-9 rounded-full border-border/50 bg-background/60 px-4 text-xs text-foreground/85 shadow-sm hover:bg-muted/40 hover:text-foreground"
                      >
                        {t.aiGenerate.prompt.random}
                      </Button>
                      <div className="inline-flex items-center">
                        <Button
                          type="button"
                          onClick={handleGenerate}
                          disabled={!canGenerate}
                          className="h-9 rounded-l-full rounded-r-none bg-foreground px-5 text-xs font-medium text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] hover:opacity-90 disabled:opacity-50"
                        >
                          {isGenerating ? t.aiGenerate.generate.generating : t.aiGenerate.generate.button}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              disabled={!canGenerate}
                              className="h-9 w-9 rounded-l-none rounded-r-full bg-foreground text-background shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)] hover:opacity-90 disabled:opacity-50"
                              aria-label={t.aiGenerate.generate.button}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleGenerate}>
                              {t.aiGenerate.generate.button}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleGenerateInCanvas}>
                              {t.aiGenerate.generate.canvas}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </FeatureCard>
            )}

            {(isGenerating || generatedImage) && (
              <FeatureCard className={panelClass}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {t.aiGenerate.comparison.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t.aiGenerate.comparison.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-sm font-semibold mb-1 text-foreground">
                            {t.aiGenerate.comparison.reference}
                          </h3>
                          <p className="text-xs text-muted-foreground opacity-0" aria-hidden="true">
                            .
                          </p>
                        </div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted/20">
                          {uploadedImage ? (
                            <Image
                              src={uploadedImage}
                              alt="Original"
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                              {t.aiGenerate.comparison.empty}
                            </div>
                          )}
                        </div>
                      </div>
                      <ResultDisplay
                        generatedImage={generatedImage}
                        isGenerating={isGenerating}
                        onRegenerate={handleGenerate}
                      />
                    </div>
                  </div>
                </CardContent>
              </FeatureCard>
            )}
          </div>
        </FeaturePageShell>
      </section>

      {/* Capability Spotlight */}
      <section className="py-20 md:py-24">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-14 max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {t.featuresPage.inspiration.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {t.featuresPage.inspiration.subtitle}
            </p>
          </motion.div>

          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            {t.featuresPage.inspiration.items.map((item: any, index: number) => (
              <motion.div
                key={index}
                className="grid gap-6 rounded-3xl border border-border/60 bg-card/65 p-6 shadow-[0_26px_70px_-56px_rgba(15,23,42,0.5)] md:p-8 lg:grid-cols-2 lg:items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.tag}</div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                    {item.description}
                  </p>
                  <div className="mt-5 rounded-xl border border-border/60 bg-background/75 p-3 text-xs text-muted-foreground">
                    {item.prompt}
                  </div>
                </div>

                <div className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                    <img
                      src={`https://picsum.photos/seed/${item.imageSeed}/1200/760`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/45 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
                      {item.tag}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infinite Canvas */}
      <section className="bg-muted/40 py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-10 max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t.featuresPage.features.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {t.featuresPage.features.subtitle}
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-full border-border/60 bg-background/80">
                <Link href={`/${currentLocale}/canvas`}>{t.aiGenerate.generate.canvas}</Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.featuresPage.features.items.map((item: any, index: number) => {
              const CapabilityIcon = capabilityIcons[index % capabilityIcons.length];

              return (
                <motion.div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-background/80 p-5"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accentToneClasses[index % accentToneClasses.length]}`}>
                    <CapabilityIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Scenarios */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-10 max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {t.featuresPage.explore.title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {t.featuresPage.explore.subtitle}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.featuresPage.explore.items.map((item: any, index: number) => (
              <FeatureCard key={index} className="overflow-hidden border-border/60 bg-background/80">
                <CardContent className="space-y-4 pt-6">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                    <img
                      src={`https://picsum.photos/seed/${item.imageSeed}/1200/760`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent" />
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold ${accentToneClasses[index % accentToneClasses.length]}`}>
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-muted/50 py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-12 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {t.featuresPage.workflow.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t.featuresPage.workflow.subtitle}</p>
          </motion.div>

          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-border/60 md:block" />
            {t.featuresPage.workflow.steps.map((step: any, index: number) => (
              <motion.div
                key={index}
                className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentToneClasses[index % accentToneClasses.length]}`}>
                    {index === 0 && <Layers3 className="h-4 w-4" />}
                    {index === 1 && <ScanLine className="h-4 w-4" />}
                    {index === 2 && <SwatchBook className="h-4 w-4" />}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t.featuresPage.workflow.tip}</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-12 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {t.featuresPage.testimonials.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t.featuresPage.testimonials.subtitle}</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.featuresPage.testimonials.items.map((testimonial: any, index: number) => (
              <motion.div
                key={index}
                className="rounded-3xl border border-border/60 bg-card/75 p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${accentToneClasses[index % accentToneClasses.length]}`}
                  >
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/50 py-20">
        <div className="container px-4 md:px-6">
          <motion.div
            className="mx-auto mb-12 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {t.featuresPage.faq.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t.featuresPage.faq.subtitle}</p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-4">
            {t.featuresPage.faq.items.map((item: any, index: number) => (
              <motion.div
                key={index}
                className="rounded-3xl border border-border/60 bg-background/80 p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-chart-warm py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.14),transparent_45%)]" />
        <div className="container relative z-10 px-4 md:px-6">
          <motion.div
            className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/10 px-8 py-10 text-center backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold md:text-5xl">{t.featuresPage.finalCta.title}</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">{t.featuresPage.finalCta.subtitle}</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg">
                <Link href={`/${currentLocale}/canvas`}>{t.featuresPage.finalCta.buttons.primary}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-4 text-lg">
                <Link href={`/${currentLocale}/pricing`}>{t.featuresPage.finalCta.buttons.secondary}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
