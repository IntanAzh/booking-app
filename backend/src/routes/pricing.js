const express = require("express");
const router = express.Router();

const PricingRule = require("../models/pricingRule");
const Service = require("../models/service");
const User = require("../models/user");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const {
  calculateDynamicPrice,
  defaultPricingRules,
} = require("../utils/pricing");

const ruleTypes = ["weekend", "peak_hour", "demand"];
const adjustmentTypes = ["percentage", "fixed"];
const parseBoolean = (value) => value === true || value === "true" || value === 1;

const normalizeConditions = (conditions) => {
  if (!conditions) return {};

  if (typeof conditions === "string") {
    return JSON.parse(conditions);
  }

  return conditions;
};

const validateRulePayload = (body, isUpdate = false) => {
  const { name, rule_type, adjustment_type, adjustment_value, conditions } = body;

  if (!isUpdate && (!name || !rule_type || adjustment_value === undefined)) {
    const error = new Error("name, rule_type, dan adjustment_value wajib diisi");
    error.status = 400;
    throw error;
  }

  if (rule_type !== undefined && !ruleTypes.includes(rule_type)) {
    const error = new Error("rule_type tidak valid");
    error.status = 400;
    error.valid_rule_types = ruleTypes;
    throw error;
  }

  if (
    adjustment_type !== undefined &&
    !adjustmentTypes.includes(adjustment_type)
  ) {
    const error = new Error("adjustment_type tidak valid");
    error.status = 400;
    error.valid_adjustment_types = adjustmentTypes;
    throw error;
  }

  if (adjustment_value !== undefined && Number(adjustment_value) < 0) {
    const error = new Error("adjustment_value tidak boleh negatif");
    error.status = 400;
    throw error;
  }

  return {
    name,
    rule_type,
    adjustment_type,
    adjustment_value,
    conditions:
      conditions === undefined && isUpdate
        ? undefined
        : normalizeConditions(conditions),
    is_active: body.is_active,
  };
};

router.post("/calculate", async (req, res) => {
  try {
    const { service_id, provider_id, start_time } = req.body;

    if (!service_id || !provider_id || !start_time) {
      return res.status(400).json({
        message: "service_id, provider_id, dan start_time wajib diisi",
      });
    }

    const service = await Service.findByPk(service_id);
    if (!service || !service.is_active) {
      return res.status(404).json({
        message: "Service tidak ditemukan atau tidak aktif",
      });
    }

    const provider = await User.findOne({
      where: {
        id: provider_id,
        role: "provider",
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider tidak ditemukan" });
    }

    const pricing = await calculateDynamicPrice({
      service,
      providerId: provider_id,
      startTime: start_time,
    });

    res.json({
      message: "Perhitungan pricing berhasil",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/rules", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const rules = await PricingRule.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Data pricing rules",
      data: rules,
      defaults_used_when_empty: rules.length === 0 ? defaultPricingRules : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/rules", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const payload = validateRulePayload(req.body);
    const rule = await PricingRule.create({
      ...payload,
      adjustment_type: payload.adjustment_type || "percentage",
      is_active:
        payload.is_active === undefined ? true : parseBoolean(payload.is_active),
    });

    res.status(201).json({
      message: "Pricing rule berhasil dibuat",
      data: rule,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
      valid_rule_types: error.valid_rule_types,
      valid_adjustment_types: error.valid_adjustment_types,
    });
  }
});

router.put("/rules/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const rule = await PricingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: "Pricing rule tidak ditemukan" });
    }

    const payload = validateRulePayload(req.body, true);
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (payload.is_active !== undefined) {
      payload.is_active = parseBoolean(payload.is_active);
    }

    await rule.update(payload);

    res.json({
      message: "Pricing rule berhasil diupdate",
      data: rule,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
      valid_rule_types: error.valid_rule_types,
      valid_adjustment_types: error.valid_adjustment_types,
    });
  }
});

module.exports = router;
