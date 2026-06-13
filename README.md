# Mandarin Tone Trainer

A browser prototype for a children's Mandarin learning website that uses camera and microphone input to practice tone gestures and speech.

## Run Locally

```bash
/Users/karahwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.mjs
```

Then open:

```txt
http://127.0.0.1:4173
```

## Current Prototype

- Shows a Mandarin tone lesson.
- Requests camera and microphone permission.
- Draws a target rising-tone shape.
- Displays a placeholder hand path.
- Reads microphone activity.
- Gives simple tone-practice feedback.

## Next Steps

- Replace the placeholder hand path with MediaPipe hand tracking.
- Add real pitch detection for Mandarin tone scoring.
- Add more lessons, characters, and kid-friendly rewards.
