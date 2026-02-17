document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('wasteExchangeForm');
  const rewardDialog = document.getElementById('rewardDialog');
  const thankYouDialog = document.getElementById('thankYouDialog');
  const thankYouMsg = document.getElementById('thankYouMsg');
  const thankYouOk = document.getElementById('thankYouOk');
  const chooseCoins = document.getElementById('chooseCoins');
  const chooseReward = document.getElementById('chooseReward');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    rewardDialog.style.display = 'flex';
  });

  chooseCoins.onclick = function() {
    // Add 10 coins to localStorage (same as report.html)
    let coins = Number(localStorage.getItem('coins') || 0);
    coins += 10;
    localStorage.setItem('coins', coins);
    rewardDialog.style.display = 'none';
    thankYouMsg.textContent = 'You have received 10 coins! Thank you for using Waste Exchange.';
    thankYouDialog.style.display = 'flex';
  };

  chooseReward.onclick = function() {
    rewardDialog.style.display = 'none';
    thankYouMsg.textContent = 'You can claim your reward soon! Thank you for using Waste Exchange.';
    thankYouDialog.style.display = 'flex';
  };

  thankYouOk.onclick = function() {
    thankYouDialog.style.display = 'none';
    window.location.href = 'Home.html';
  };
});
