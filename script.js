const HOURLY_RATE = 17.5;

const carCatalog = [
  { id: 1, name: "Toyota Corolla", image: "cars/car1.jpg", available: true },
  { id: 2, name: "Honda Civic", image: "cars/car2.jpg", available: true },
  { id: 3, name: "Hyundai Elantra", image: "cars/car3.jpg", available: true },
  { id: 4, name: "Kia Rio", image: "cars/car4.jpg", available: true },
  { id: 5, name: "Chevy Spark", image: "cars/car5.jpg", available: false },
  { id: 6, name: "Ford Fiesta", image: "cars/car6.jpg", available: true },
  { id: 7, name: "Nissan Versa", image: "cars/car7.jpg", available: true }
];

let rentals = [];

function renderCars() {
  const container = document.getElementById("carList");
  container.innerHTML = "";
  carCatalog.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";
    if (!car.available) {
      card.style.opacity = 0.5;
      card.style.pointerEvents = "none";
    }
    card.innerHTML = `
      <img src="${car.image}" alt="${car.name}" />
      <h3>${car.name}</h3>
      <p><strong>$${HOURLY_RATE}/hr</strong></p>
      <p>${car.available ? "✅ Available" : "❌ Unavailable"}</p>
    `;
    card.onclick = () => addToRental(car.id);
    container.appendChild(card);
  });
}

function calculateRentalDays(startDate, endDate) {
  const msPerDay = 86400000;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(Math.ceil((end - start) / msPerDay) + 1, 0);
}

function calculateDailyHours(startTime, endTime) {
  const [sH, sM] = startTime.split(":").map(Number);
  const [eH, eM] = endTime.split(":").map(Number);
  return Math.max((eH + eM / 60) - (sH + sM / 60), 0);
}

function addToRental(carId) {
  const startDate = document.getElementById("pickupDate").value;
  const endDate = document.getElementById("dropoffDate").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const dropoffTime = document.getElementById("dropoffTime").value;

  if (!startDate || !endDate) return alert("Select start and end date.");
  const days = calculateRentalDays(startDate, endDate);
  const hoursPerDay = calculateDailyHours(pickupTime, dropoffTime);
  if (hoursPerDay <= 0) return alert("Drop-off must be after pickup time.");

  const car = carCatalog.find(c => c.id === carId);
  if (rentals.some(r => r.id === carId)) return alert("Car already added.");
  const total = (days * hoursPerDay * HOURLY_RATE).toFixed(2);

  rentals.push({ ...car, days, hoursPerDay, total });
  updateSummary();
}

function updateSummary() {
  const tbody = document.getElementById("summaryTable");
  const totalEl = document.getElementById("totalCost");
  tbody.innerHTML = "";
  let total = 0;

  rentals.forEach((r, i) => {
    total += parseFloat(r.total);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.days}</td>
      <td>${r.hoursPerDay.toFixed(1)}</td>
      <td>$${HOURLY_RATE.toFixed(2)}</td>
      <td>$${r.total}</td>
      <td><button onclick="removeRental(${i})" class="btn btn-danger">X</button></td>
    `;
    tbody.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2);
}

function removeRental(index) {
  rentals.splice(index, 1);
  updateSummary();
}

function clearAll() {
  rentals = [];
  updateSummary();
  ["renterName", "renterEmail", "pickupDate", "pickupTime", "dropoffDate", "dropoffTime"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("pickupTime").value = "08:00";
  document.getElementById("dropoffTime").value = "18:00";
  document.getElementById("bookAdvance").checked = false;
}

function exportPDF() {
  const name = document.getElementById("renterName").value;
  const email = document.getElementById("renterEmail").value;
  const location = document.getElementById("locationSelect").value;
  const payment = document.getElementById("paymentMethod").value;
  const startDate = document.getElementById("pickupDate").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const endDate = document.getElementById("dropoffDate").value;
  const dropoffTime = document.getElementById("dropoffTime").value;
  const totalAmount = document.getElementById("totalCost").textContent;

  if (!name || !email || !startDate || !endDate || rentals.length === 0) {
    alert("Fill all renter info and add at least one car.");
    return;
  }

  const printArea = document.getElementById("rentalPrintArea");
  printArea.innerHTML = `
    <div style="font-family: 'Poppins', sans-serif; padding: 60px; color: #1f2937; width: 100%; max-width: 750px; margin: auto;">
      <div style="background: #4f46e5; color: white; padding: 20px 30px; border-radius: 12px;">
        <h2 style="margin: 0;">KTZ Car Rentals Agreement</h2>
        <p style="margin: 5px 0;">Rental Summary & U.S. Policy</p>
      </div>

      <div style="margin-top: 30px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pickup:</strong> ${startDate} @ ${pickupTime}</p>
        <p><strong>Drop-off:</strong> ${endDate} @ ${dropoffTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Payment Method:</strong> ${payment}</p>
      </div>

      <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 13px;">
        <thead style="background: #e5e7eb;">
          <tr>
            <th style="padding: 10px; text-align: left;">Car</th>
            <th>Days</th>
            <th>Hrs/Day</th>
            <th>Rate</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rentals.map(r => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px;">${r.name}</td>
              <td style="text-align: center;">${r.days}</td>
              <td style="text-align: center;">${r.hoursPerDay.toFixed(1)}</td>
              <td style="text-align: center;">$${HOURLY_RATE.toFixed(2)}</td>
              <td style="text-align: right;">$${r.total}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <p style="margin-top: 20px; font-weight: bold;">Total: $${totalAmount}</p>
      <p style="margin-top: 40px;">Signature: _________________________ <span style="float:right;">KTZ CARS</span></p>

      <div style="margin-top: 60px;">
        <h3 style="background: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px;">United States Car Rental Policy</h3>
        <p style="font-size: 13px; line-height: 1.7; margin-top: 10px;">
          This agreement outlines the terms between KTZ Car Rentals and the renter. The renter acknowledges the following:<br><br>
          1. Vehicle must be returned in the same condition as received.<br>
          2. Daily pick-up and drop-off times are enforced and must be honored.<br>
          3. Late returns are charged per hour beyond agreed drop-off.<br>
          4. Smoking inside the vehicle is strictly prohibited.<br>
          5. The renter is liable for any traffic violations, tolls, or damages.<br>
          6. Vehicles are for use within the United States unless written consent is obtained.<br>
          7. Renter agrees to insurance coverage or waives liability if declined.<br>
          8. Full payment must be made prior to vehicle release.<br>
          9. Use of the vehicle must comply with all federal and state laws.<br>
          10. This document serves as a legally binding rental agreement.<br><br>
          By signing, the renter agrees to all terms stated above.
        </p>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    html2pdf().set({
      margin: 0,
      filename: `KTZ_Rental_${name}.pdf`,
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    }).from(printArea).save().then(() => {
      printArea.innerHTML = '';
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCars();
  document.getElementById("exportPdfBtn").addEventListener("click", exportPDF);
  document.getElementById("clearAllBtn").addEventListener("click", clearAll);

  const bookAdvance = document.getElementById("bookAdvance");
  if (bookAdvance) {
    bookAdvance.addEventListener("change", () => {
      if (bookAdvance.checked) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 86400000);
        const dayAfter = new Date(now.getTime() + 2 * 86400000);

        const format = d => d.toISOString().split("T")[0];
        document.getElementById("pickupDate").value = format(tomorrow);
        document.getElementById("dropoffDate").value = format(dayAfter);
        document.getElementById("pickupTime").value = "10:00";
        document.getElementById("dropoffTime").value = "18:00";

        bookAdvance.classList.add("animate-pop");
        setTimeout(() => bookAdvance.classList.remove("animate-pop"), 400);
      } else {
        document.getElementById("pickupDate").value = "";
        document.getElementById("dropoffDate").value = "";
        document.getElementById("pickupTime").value = "08:00";
        document.getElementById("dropoffTime").value = "18:00";
      }
    });
  }
});
