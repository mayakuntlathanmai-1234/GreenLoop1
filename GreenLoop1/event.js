document.addEventListener('DOMContentLoaded', function() {
  const events = [
    {
      title: "GreenLoop Community Clean-Up Drive",
      date: "April 20, 2025",
      location: "Central Park, City Center",
      desc: "Join fellow volunteers for a morning of cleaning up litter and raising awareness about proper waste disposal. All supplies will be provided. Let's make our city greener together!"
    },
    {
      title: "E-Waste Collection & Awareness Camp",
      date: "May 5, 2025",
      location: "GreenLoop Campus, Hall B",
      desc: "Safely dispose of your old electronics and learn about the hazards of e-waste. Free recycling for small devices and informative sessions by experts."
    },
    {
      title: "Sustainable Living Workshop",
      date: "May 18, 2025",
      location: "EcoHub Auditorium",
      desc: "A hands-on workshop covering composting, recycling, and upcycling. Open to all ages. Take home a DIY compost kit and practical tips for sustainable living."
    },
    {
      title: "Plastic-Free Challenge Launch",
      date: "June 1, 2025",
      location: "Online Event",
      desc: "Kick off our month-long challenge to reduce single-use plastics. Participate in daily tasks, share your progress, and win exciting rewards!"
    }
  ];

  const container = document.getElementById('events-list');
  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-card-title">${ev.title}</div>
      <div class="event-card-date"><i class="fa-regular fa-calendar"></i> ${ev.date}</div>
      <div class="event-card-location"><i class="fa-solid fa-location-dot"></i> ${ev.location}</div>
      <div class="event-card-desc">${ev.desc}</div>
    `;
    container.appendChild(card);
  });
});
