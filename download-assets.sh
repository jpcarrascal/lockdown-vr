#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p images

# Download all assets
echo "Downloading assets..."

# 3D Models (.glb files)
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FSnare-tripod.glb?v=1588790687489" -o "images/Snare-tripod.glb" --progress-bar
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FHihat-tripod.glb?v=1588790685367" -o "images/Hihat-tripod.glb"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FKick-pedal.glb?v=1588790686001" -o "images/Kick-pedal.glb"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FKdrum-leg.glb?v=1588790685734" -o "images/Kdrum-leg.glb"

# Images
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fparquet00b.png?v=1588790688089" -o "images/parquet00b.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Ftile-texture.jpg?v=1588790683382" -o "images/tile-texture.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fgrass.jpg?v=1588790684785" -o "images/grass.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fblock.png?v=1588790688359" -o "images/block.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FLeft-wall.png?v=1596820190090" -o "images/Left-wall.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FRight-wall.png?v=1588790684406" -o "images/Right-wall.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FBack-wall.jpg?v=1632051990699" -o "images/Back-wall.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fclock.png?v=1588790683549" -o "images/clock.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fkick-skin.jpg?v=1588790683908" -o "images/kick-skin.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FBillboard.jpg?v=1588790684153" -o "images/Billboard.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Ftable.png?v=1591005267227" -o "images/table.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Ffavicon.ico?v=1588790683613" -o "images/favicon.ico"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fspacebarman-logo.png?v=1589649870126" -o "images/spacebarman-logo.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fparticle.png?v=1589106936463" -o "images/particle.png"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FthreeTone.jpg?v=1588790683498" -o "images/threeTone.jpg"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FfiveTone.jpg?v=1588790683738" -o "images/fiveTone.jpg"

# Audio files
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FKD.mp3?v=1588790685488" -o "images/KD.mp3"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FSD.mp3?v=1588790686804" -o "images/SD.mp3"
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2FHH.mp3?v=1588790683823" -o "images/HH.mp3"

# Video files
curl -L --progress-bar "https://cdn.glitch.com/109d7acc-45a0-4bd5-aeed-6665c9c783e8%2Fshadow.mp4?v=1589038873188" -o "images/shadow.mp4"

echo "All assets downloaded to the images directory."
