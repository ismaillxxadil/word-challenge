
import { useEffect, useRef } from "react";
import { Howl } from "howler";

type SoundType = 
    | "hover" 
    | "click" 
    | "play" 
    | "draw" 
    | "win" 
    | "lose" 
    | "start" 
    | "turn"
    | "invalid";

// Map sound types to file paths
// Note: We'll use the files we found. If not found, it just won't play (or we can handle error)
const SOUND_PATHS: Record<SoundType, string> = {
    hover: "/sounds/hover_card.wav",
    click: "/sounds/click_btn.mp3",
    play: "/sounds/play_card.wav",
    draw: "/sounds/draw_card.wav",
    win: "/sounds/win.ogg",
    lose: "/sounds/lose.mp3", // create placeholder or handle missing
    start: "/sounds/game_start.mp3", // create placeholder
    turn: "/sounds/your_turn.mp3", // create placeholder
    invalid: "/sounds/invalid_move.wav"
};

export const useSound = () => {
    const sounds = useRef<Record<SoundType, Howl | null>>({
        hover: null,
        click: null,
        play: null,
        draw: null,
        win: null,
        lose: null,
        start: null,
        turn: null,
        invalid: null
    });

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUND_PATHS).forEach(([key, path]) => {
            const type = key as SoundType;
            sounds.current[type] = new Howl({
                src: [path],
                volume: 0.5, // Default volume
                preload: true,
                html5: true // Force HTML5 Audio to stream large files if needed, though most here are small
            });
        });

        // Cleanup
        return () => {
             Object.values(sounds.current).forEach(sound => sound?.unload());
        };
    }, []);

    const play = (type: SoundType, options?: { volume?: number }) => {
        const sound = sounds.current[type];
        if (sound) {
            if (options?.volume !== undefined) {
                sound.volume(options.volume);
            }
            sound.play();
        }
    };

    return { play };
};
