# Birthday world for Aiman

Open `index.html` directly, or serve the folder / drop it on any static host (Vercel, Netlify, GitHub Pages). No build step; three.js r149 is vendored.

## Make it yours (all in `app.js` → `CONFIG`)
- `name`, `from`: shown across the page and as the letter sign-off.
- `music`: optional. A soft romantic generative score plays by default (no birthday song). To use your own track instead, drop it at `music/song.mp3`. The music button mutes/unmutes either.
- `work`: her Aim to Crochet photos. Drop square-ish images into `img/work/` using the names in `CONFIG.work`; missing ones are skipped and the section still looks right without them.
- `wishes`: the twelve messages hidden in the 3D objects.

The letter and story copy live in `index.html` (`#paper`, `#charlie`).
`assets.js` embeds the cut-out stickers so WebGL can load them even when opened from disk; regenerate it if you change `img/charlie.webp`, `img/girl-knit.webp` or `img/girl-yarn.webp`.
