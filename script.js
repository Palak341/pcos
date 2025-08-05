// Get elements
const consentCheckbox = document.getElementById('consent-checkbox');
const startButton = document.getElementById('start-assessment');

// Function to enable or disable the Start Assessment button
function toggleStartButton() {
  if (consentCheckbox.checked) {
    startButton.disabled = false;
    startButton.classList.remove('disabled');
  } else {
    startButton.disabled = true;
    startButton.classList.add('disabled');
  }
}

// Event listener for checkbox change
consentCheckbox.addEventListener('change', toggleStartButton);

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.carousel-content');
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const videoWidth = 580; // width + gap

  nextBtn.addEventListener('click', () => {
      carousel.scrollBy({
          left: videoWidth,
          behavior: 'smooth'
      });
  });

  prevBtn.addEventListener('click', () => {
      carousel.scrollBy({
          left: -videoWidth,
          behavior: 'smooth'
      });
  });

  // Hide/show buttons based on scroll position
  carousel.addEventListener('scroll', () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      prevBtn.style.display = carousel.scrollLeft === 0 ? 'none' : 'block';
      nextBtn.style.display = carousel.scrollLeft === maxScroll ? 'none' : 'block';
  });
});

function changeVideo(direction) {
  videos[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + direction + videos.length) % videos.length;
  videos[currentIndex].classList.add('active');
}