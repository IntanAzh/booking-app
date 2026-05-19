const { Op } = require("sequelize");
const Booking = require("../models/booking");

const toDateOnly = (date) => date.toISOString().slice(0, 10);

const calculateDynamicPrice = async ({ service, providerId, startTime }) => {
  const bookingDate = new Date(startTime);
  const basePrice = Number(service.price);
  const breakdown = [
    {
      label: "base_price",
      type: "fixed",
      amount: basePrice,
    },
  ];

  let multiplier = 1;
  const day = bookingDate.getDay();
  const hour = bookingDate.getHours();

  if (day === 0 || day === 6) {
    multiplier += 0.2;
    breakdown.push({
      label: "weekend_surcharge",
      type: "percentage",
      amount: 20,
    });
  }

  if (hour >= 17 && hour < 21) {
    multiplier += 0.15;
    breakdown.push({
      label: "peak_hour_surcharge",
      type: "percentage",
      amount: 15,
    });
  }

  const dateOnly = toDateOnly(bookingDate);
  const demandCount = await Booking.count({
    where: {
      service_id: service.id,
      provider_id: providerId,
      status: {
        [Op.in]: ["pending", "confirmed", "completed"],
      },
      start_time: {
        [Op.gte]: new Date(`${dateOnly}T00:00:00`),
        [Op.lt]: new Date(`${dateOnly}T23:59:59`),
      },
    },
  });

  if (demandCount >= 10) {
    multiplier += 0.2;
    breakdown.push({
      label: "high_demand_surcharge",
      type: "percentage",
      amount: 20,
    });
  } else if (demandCount >= 5) {
    multiplier += 0.1;
    breakdown.push({
      label: "demand_surcharge",
      type: "percentage",
      amount: 10,
    });
  }

  const totalPrice = Number((basePrice * multiplier).toFixed(2));

  return {
    base_price: basePrice,
    total_price: totalPrice,
    demand_count: demandCount,
    breakdown,
  };
};

module.exports = {
  calculateDynamicPrice,
};
