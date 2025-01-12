// Анимация прокрутки слота
function spinSlots() {
  const results = [];
  slotElements.forEach((slot, index) => {
    const randomSymbols = Array.from({ length: 20 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    results.push(randomSymbols[randomSymbols.length - 1]);

    // Анимация прокрутки с эффектом размытия
    const totalDuration = 2 + index * 0.5; // Разное время для каждого слота
    gsap.fromTo(
      slot,
      { y: 0, filter: 'blur(5px)' },
      {
        y: -100 * randomSymbols.length,
        duration: totalDuration,
        ease: "power4.out", // Медленное замедление
        onUpdate: function () {
          const step = Math.floor(this.progress() * randomSymbols.length);
          slot.textContent = randomSymbols[step];
        },
        onComplete: function () {
          slot.textContent = results[index];
          slot.style.transform = 'translateY(0)';
          gsap.to(slot, { filter: 'blur(0px)', duration: 0.2 }); // Убрать размытие
        },
      }
    );

    // Визуальные эффекты подсветки
    gsap.fromTo(
      slot,
      { scale: 1 },
      {
        scale: 1.2,
        duration: totalDuration / 4,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
      }
    );
  });

  return results;
}
