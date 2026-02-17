document.addEventListener('DOMContentLoaded', function() {
  const quizForm = document.getElementById('quizForm');
  const quizResult = document.getElementById('quizResult');
  const scoreSpan = document.getElementById('score');
  const certSection = document.getElementById('certificateSection');
  const failSection = document.getElementById('failSection');
  const downloadCert = document.getElementById('downloadCert');

  quizForm.addEventListener('submit', function(e) {
    e.preventDefault();    // Correct answers: 1-b, 2-b, 3-a, 4-b, 5-b
    let score = 0;
    if (quizForm.q1.value === 'b') score++;
    if (quizForm.q2.value === 'b') score++;
    if (quizForm.q3.value === 'a') score++;
    if (quizForm.q4.value === 'b') score++;
    if (quizForm.q5.value === 'b') score++;

    quizForm.style.display = 'none';
    quizResult.style.display = 'block';
    scoreSpan.textContent = score;

    if (score >= 3) {
      certSection.style.display = 'block';
      failSection.style.display = 'none';
    } else {
      certSection.style.display = 'none';
      failSection.style.display = 'block';
    }
  });

  if (downloadCert) {
    downloadCert.addEventListener('click', function() {
      // Generate a simple certificate as an image using canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      // Background
      ctx.fillStyle = "#e9fbe7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Border
      ctx.strokeStyle = "#198754";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, canvas.width-20, canvas.height-20);
      // Text
      ctx.fillStyle = "#198754";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Certificate of Completion", 300, 90);
      ctx.font = "20px Arial";
      ctx.fillStyle = "#333";
      ctx.fillText("This certifies that you have successfully", 300, 160);
      ctx.fillText("completed the Basic Waste Management Quiz", 300, 190);
      ctx.fillStyle = "#198754";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Score: " + scoreSpan.textContent + "/5", 300, 250);
      ctx.font = "18px Arial";
      ctx.fillStyle = "#333";
      ctx.fillText("GreenLoop", 300, 320);
      ctx.font = "16px Arial";
      ctx.fillText("Date: " + new Date().toLocaleDateString(), 300, 350);

      // Download
      const link = document.createElement('a');
      link.download = "GreenLoop_Certificate.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  }
});
