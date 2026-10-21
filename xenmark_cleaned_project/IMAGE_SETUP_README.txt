IMAGE SETUP
-----------
All content-image paths are stored in data.json. The HTML refers to media keys such as media_1.
The JavaScript reads data.json for the actual local path and for local image rotation sets.
The _image_notes and _image_set_notes objects document where each image appears.
These notes are valid JSON properties because standard JSON does not support // comments.
Keep index.html, script.js, style.css, data.json, and the images/ folder together.
media_47 is still the hero video URL; replace it in data.json if you later upload your own video.
