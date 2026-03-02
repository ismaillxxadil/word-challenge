import { useEffect, useRef, useCallback } from "react";
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
    | "invalid"
    | "var"
    | "timmer";

const SOUND_PATHS: Record<SoundType, string> = {
    hover: "/sounds/hover_card.wav",
    click: "/sounds/click_btn.mp3",
    play: "/sounds/play_card.wav",
    draw: "/sounds/draw_card.wav",
    win: "/sounds/win.ogg",
    lose: "/sounds/lose.mp3",
    start: "/sounds/air-woosh.wav",
    turn: "/sounds/your_turn.mp3",
    invalid: "/sounds/invalid_move.wav",
    var: "/sounds/VAR.mp3",
    timmer: "/sounds/timmer.mp3"
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
        invalid: null,
        var: null,
        timmer: null
    });

    useEffect(() => {
        Object.entries(SOUND_PATHS).forEach(([key, path]) => {
            const type = key as SoundType;
            sounds.current[type] = new Howl({
                src: [path],
                volume: 1.0,
                preload: true,
                html5: false
            });
        });

        return () => {
            Object.values(sounds.current).forEach(sound => sound?.unload());
        };
    }, []);

    const play = useCallback((type: SoundType, options?: { volume?: number }) => {
        const sound = sounds.current[type];
        if (sound) {
            if (options?.volume !== undefined) {
                sound.volume(options.volume);
            }
            sound.play();
        }
    }, []);

    const stop = useCallback((type: SoundType) => {
        const sound = sounds.current[type];
        if (sound) {
            sound.stop();
        }
    }, []);

    return { play, stop };
};
