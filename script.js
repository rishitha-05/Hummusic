let mediaRecorder;
let audioChunks = [];

document.getElementById("recordBtn").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.start();
  document.getElementById("recordBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;

  audioChunks = []; // Reset audio chunks on new recording
  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };
});

document.getElementById("stopBtn").addEventListener("click", () => {
  mediaRecorder.stop();
  document.getElementById("recordBtn").disabled = false;
  document.getElementById("stopBtn").disabled = true;

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Set the audio playback source
    const audioPlayback = document.getElementById("audioPlayback");
    audioPlayback.src = audioUrl;

    // Prepare to send the audio to the backend
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    // Send the audio file to the backend
    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then(response => response.text())
      .then(result => {
        document.getElementById("responseMessage").textContent = result;
      })
      .catch(() => {
        document.getElementById("responseMessage").textContent = "Failed to send audio file.";
      });
  };
});
