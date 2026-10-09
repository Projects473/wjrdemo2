/* WJR Taxi Tours & Auto Rentals: rental rates and booked dates.
   Edit this file to change rental prices, then upload it again.

   cars: one line per vehicle.
     daily  = EC$ per day for rentals of less than 7 days
     weekly = EC$ per day for rentals of 7 days or more

   Booked dates: Wayne adds and deletes bookings on admin.html. They are saved in
     the file named in bookingsFile (data/bookings.json) in the GitHub repository below,
     and the website calendar reads them from there.

   booked (below) is only a fallback, used if that file cannot be read.

   github: where the website lives on GitHub. Change these if the repository is renamed.

   email: the confirmation email sent to customers from admin.html (see SETUP-EMAIL.md).
     Fill in the three EmailJS values to send automatically. Left empty, the bookings page
     opens the confirmation in Wayne's email app instead, ready to send.
   files: the rental agreement and logo used in the confirmation email.
*/
window.WJR_RENTALS = {
  cars: [
    { id: "ignis", name: "Suzuki Ignis Hybrid", option: "Suzuki Ignis Hybrid (4 seats)", daily: 130, weekly: 110 },
    { id: "raize", name: "Toyota Raize Hybrid", option: "Toyota Raize Hybrid (5 seats)", daily: 150, weekly: 120 },
    { id: "vezel", name: "Honda Vezel Hybrid",  option: "Honda Vezel Hybrid (5 seats)",  daily: 160, weekly: 120 }
  ],
  booked: {
    ignis: [["2026-10-12", "2026-10-15"], ["2026-10-24", "2026-10-31"]],
    raize: [["2026-10-10", "2026-10-11"], ["2026-10-18", "2026-10-22"], ["2026-11-05", "2026-11-09"]],
    vezel: [["2026-10-14", "2026-10-20"], ["2026-11-02", "2026-11-06"]]
  },
  bookingsFile: "data/bookings.json",
  github: { owner: "projects473", repo: "wjrdemo2", branch: "main" },
  email: { publicKey: "", serviceId: "", templateId: "", replyTo: "wjrtt@outlook.com" },
  files: { agreement: "files/WJR-Rental-Agreement.pdf", logo: "assets/wjr-logo-sm.png" }
};
