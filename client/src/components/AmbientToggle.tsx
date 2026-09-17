import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { ambientEngine } from "@/lib/ambientAudio";
import { useSkyMode } from "@/contexts/SkyModeContext";

function biomeFromPeriodWeather(
  period: string,
  weather: string,
): "space" | "coast" | "mountains" | "desert" | "plains" {
  if (period === "night" || period === "dusk") return weather === "clear" ? "space" : "mountains";
  if (period === "dawn" || period === "sunrise") return "coast";
  if (period === "golden" || period === "sunset") return "desert";
  if (weather === "rain" || weather === "overcast") return "mountains";
  if (weather === "fog") return "coast";
  return "plains";
}

export default function AmbientToggle() {
  const { period, weather } = useSkyMode();
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const biome = biomeFromPeriodWeather(period, weather);
    ambientEngine.update({
      weather: weather as any,
      biome,
      period: period as any,
    });
  }, [period, weather]);

  const toggle = async () => {
    if (!ambientEngine.isEnabled) {
      await ambientEngine.unlock();
      setReady(true);
      setMuted(false);
      return;
    }
    const next = !muted;
    ambientEngine.setMuted(next);
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      title={muted ? "Enable ambient sound" : "Mute ambient sound"}
      aria-label={muted ? "Enable ambient sound" : "Mute ambient sound"}
      className={`grid h-7 w-7 place-items-center rounded-full border border-white/12 transition ${
        muted ? "bg-black/20 text-white/45 hover:text-white" : "bg-white/15 text-white"
      }`}
    >
      {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      {!ready && muted ? null : null}
    </button>
  );
}
