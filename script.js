let mediaRecorder;
let audioChunks = [];
let timerInterval;
let recordingTime = 0;
let totalRecordingTime = 0;

// Get elements
const recordingIndicator = document.getElementById("recordingIndicator");
const timerDisplay = document.getElementById("timerDisplay");
const audioHeading = document.getElementById("audioHeading");
const audioPlayback = document.getElementById("audioPlayback");

document.getElementById("recordBtn").addEventListener("click", async () => {
  // Reset the state before starting new recording
  resetRecordingState();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.start();
  document.getElementById("recordBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;

  // Show the recording indicator and red timer
  recordingIndicator.style.opacity = "1";
  timerDisplay.style.opacity = "1";
  timerDisplay.style.color = "red"; // Red timer during recording

  // Start timer
  recordingTime = 0;
  totalRecordingTime = 0;
  updateTimerDisplay(); // Reset timer to 0:00
  timerInterval = setInterval(updateTimer, 1000);

  audioChunks = [];
  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };
});

document.getElementById("stopBtn").addEventListener("click", () => {
  mediaRecorder.stop();
  document.getElementById("recordBtn").disabled = false;
  document.getElementById("stopBtn").disabled = true;

  // Hide the red timer and stop the recording indicator
  clearInterval(timerInterval);
  timerDisplay.style.opacity = "0"; // Hide red timer once recording stops

  // Stop the bouncing animation on the bars
  const bars = recordingIndicator.querySelectorAll(".bar");
  bars.forEach(bar => {
    bar.classList.add("no-bounce"); // Stop the bounce animation
    bar.style.height = `${getRandomHeight()}px`; // Set a random height after recording
  });

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Set the audio playback source
    audioPlayback.src = audioUrl;

    // Send the audio file to the backend
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

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

    // Show the audio heading after recording is stopped
    audioHeading.style.display = "block";
  };
});

function updateTimer() {
  recordingTime += 1;
  totalRecordingTime += 1;

  // Update the timer display as elapsed / total time
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(recordingTime / 60)).padStart(2, "0");
  const seconds = String(recordingTime % 60).padStart(2, "0");

  // Update the timer format to elapsed time (no total time shown anymore)
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Reset all elements and state to prepare for a new recording
function resetRecordingState() {
  // Reset timer and UI elements
  recordingTime = 0;
  totalRecordingTime = 0;
  updateTimerDisplay();
  timerDisplay.style.opacity = "1"; // Show timer again in red

  // Reset bars
  const bars = recordingIndicator.querySelectorAll(".bar");
  bars.forEach(bar => {
    bar.classList.remove("no-bounce"); // Remove stop animation class
    bar.style.height = "20px"; // Reset height to initial state (default size)
  });
  recordingIndicator.style.opacity = "1"; // Show indicator
  
  // Hide the final audio and timer elements
  audioHeading.style.display = "none";
  audioPlayback.src = "";
}

// Generate a random height for the bars when recording is done
function getRandomHeight() {
  // Random height between 10px and 50px
  return Math.floor(Math.random() * (50 - 10 + 1)) + 10;
}
