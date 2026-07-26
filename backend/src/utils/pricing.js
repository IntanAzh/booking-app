const { Op } = require("sequelize");
const Booking = require("../models/booking");
const PricingRule = require("../models/pricingRule");

const toDateOnly = (date) => date.toISOString().slice(0, 10);

const defaultPricingRules = [
  {
    id: null,
    name: "Weekend surcharge",
    rule_type: "weekend",
    adjustment_type: "percentage",
    adjustment_value: 20,
    conditions: { days: [0, 6] },
    is_active: true,
  },
  {
    id: null,
    name: "Peak hour surcharge",
    rule_type: "peak_hour",
    adjustment_type: "percentage",
    adjustment_value: 15,
    conditions: { start_hour: 17, end_hour: 21 },
    is_active: true,
  },
  {
    id: null,
    name: "Demand surcharge",
    rule_type: "demand",
    adjustment_type: "percentage",
    adjustment_value: 10,
    conditions: { min_bookings: 5, max_bookings: 9 },
    is_active: true,
  },
  {
    id: null,
    name: "High demand surcharge",
    rule_type: "demand",
    adjustment_type: "percentage",
    adjustment_value: 20,
    conditions: { min_bookings: 10 },
    is_active: true,
  },
];

const normalizeRule = (rule) => {
  const plainRule = typeof rule.toJSON === "function" ? rule.toJSON() : rule;

  return {
    ...plainRule,
    adjustment_value: Number(plainRule.adjustment_value),
    conditions: plainRule.conditions || {},
  };
};

const getActivePricingRules = async () => {
  const rules = await PricingRule.findAll({
    where: { is_active: true },
    order: [
      ["rule_type", "ASC"],
      ["adjustment_value", "ASC"],
    ],
  });

  if (rules.length === 0) {
    return defaultPricingRules;
  }

  return rules.map(normalizeRule);
};

const applyAdjustment = (currentPrice, basePrice, rule) => {
  if (rule.adjustment_type === "fixed") {
    return currentPrice + rule.adjustment_value;
  }

  return currentPrice + basePrice * (rule.adjustment_value / 100);
};

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

  const day = bookingDate.getDay();
  const hour = bookingDate.getHours();

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

  const rules = await getActivePricingRules();
  let totalPrice = basePrice;

  for (const rule of rules) {
    let matched = false;
    const conditions = rule.conditions || {};

    if (rule.rule_type === "weekend") {
      const days = conditions.days || [0, 6];
      matched = days.map(Number).includes(day);
    }

    if (rule.rule_type === "peak_hour") {
      const startHour = Number(conditions.start_hour ?? 17);
      const endHour = Number(conditions.end_hour ?? 21);
      matched = hour >= startHour && hour < endHour;
    }

    if (rule.rule_type === "demand") {
      const minBookings = Number(conditions.min_bookings ?? 5);
      const maxBookings =
        conditions.max_bookings === undefined
          ? null
          : Number(conditions.max_bookings);
      matched =
        demandCount >= minBookings &&
        (maxBookings === null || demandCount <= maxBookings);
    }

    if (matched) {
      totalPrice = applyAdjustment(totalPrice, basePrice, rule);
      breakdown.push({
        rule_id: rule.id,
        label: rule.name,
        rule_type: rule.rule_type,
        type: rule.adjustment_type,
        amount: rule.adjustment_value,
        conditions,
      });
    }
  }

  return {
    base_price: basePrice,
    total_price: Number(totalPrice.toFixed(2)),
    demand_count: demandCount,
    breakdown,
  };
};

module.exports = {
  calculateDynamicPrice,
  defaultPricingRules,
  getActivePricingRules,
};
