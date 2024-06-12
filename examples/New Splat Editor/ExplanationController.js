const videos = [
    {
        url: "video_keep upright.mp4",
        text: "Bitte achte darauf, dein Handy während dem platzieren immer aufrecht zu halten"
    },
    {
        url: "video_move.mp4",
        text: "Bewege das Handy umher und versuche das transparente Bild möglichst Deckungsleich mit der realen Szene zu bringen. "
    },
    {
        url: "video_back and forth.mp4",
        text: "Bewge dich auch nach vorne und Hinten um die Position so gut es geht zu treffen."
    },
    {
        url: "video_place.mp4",
        text: "Wenn du zufreiden bist, dann drücke den Button um die Szene zu platzieren. Das Erlebnis kann gleich starten"
    },
    {
        url: "video_select.mp4",
        text: "Um nun gleich ein Objekt verschwinden zu lassen, müssen wir erstmal wissen wo es im Raum liegt. Schaue das Objekt dafür mit der Kamera an. Markiere es indem du zweimal auf den Bildschirm klickst. \n Gehe dann auf die Seite des Objekts und markiere es erneut"
    }
];

let currentVideoIndex = 0;
document.getElementById('videoSource').src = videos[currentVideoIndex].url;
document.getElementById('video').load(); // Reload the video
document.getElementById('text').innerHTML = `<p>${videos[currentVideoIndex].text}</p>`;

document.getElementById('nextButton').addEventListener('click', function() {
    currentVideoIndex++;
    
    if (currentVideoIndex < videos.length) {
        document.getElementById('videoSource').src = videos[currentVideoIndex].url;
        document.getElementById('video').load(); // Reload the video
        document.getElementById('text').innerHTML = `<p>${videos[currentVideoIndex].text}</p>`;
    } else {
        document.getElementById('card').style.display = 'none';
    }
});
