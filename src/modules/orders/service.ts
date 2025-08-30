import Orders from "./model";
import AdminUser from "../adminUsers/model";
import DeliveryLog from "../deliveryLog/model";
import StaffActivity from "../staffActivityLog/model";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import {
  OrderIdType,
  orderIdSchema,
  AssignDeliveryServiceSchema,
  AssignDeliveryServiceType,
  OrderPickedupServiceType,
  OrderPickedupServiceSchema,
} from "./validation";
import { getIO } from "../../config/socket";

const getOrdersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({}).skip(skip).limit(limit),
    Orders.countDocuments(),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getPendingOrdersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ orderStatus: "pending" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "pending" }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getCompletedOrdersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [pickedupOrders, totalPickedupOrders] = await Promise.all([
    Orders.find({ orderStatus: "picked up" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "picked up" }),
  ]);

  const [deliveredOrders, totaldeliveredOrders] = await Promise.all([
    Orders.find({ orderStatus: "delivered" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "delivered" }),
  ]);

  const orders = [...pickedupOrders, ...deliveredOrders];
  const total = totalPickedupOrders + totaldeliveredOrders;

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getOrderService = async (id: OrderIdType) => {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }
  const parsedId = parsed.data;

  const order = await Orders.findById(parsedId).populate("deliveryRider", {
    id: 1,
    firstname: 1,
    lastname: 1,
    middlename: 1,
  });
  if (!order) {
    throw new NotFoundError("Order not Found!");
  }

  return order;
};

const acceptOrderService = async (id: OrderIdType, userId: string) => {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }
  const parsedId = parsed.data;

  const acceptedOrder = await Orders.findByIdAndUpdate(parsedId, {
    orderStatus: "accepted",
  });

  if (!acceptedOrder) {
    throw new NotFoundError("Order not Found!");
  }

  await StaffActivity.create({
    staff: userId,
    order: acceptedOrder.id,
    action: "accepted",
  });

  return acceptedOrder;
};

const getAcceptedOrderServices = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ orderStatus: "accepted" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "accepted" }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const outForDeliveryService = async (id: OrderIdType, userId: string) => {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }

  const parsedId = parsed.data;

  const outForDeliveryOrder = await Orders.findByIdAndUpdate(parsedId, {
    orderStatus: "for delivery",
  });

  if (!outForDeliveryOrder) {
    throw new NotFoundError("Order not Found!");
  }

  await StaffActivity.create({
    staff: userId,
    order: outForDeliveryOrder.id,
    action: "for delivery",
  });

  return outForDeliveryOrder;
};

const getForDeliveryOrdersServices = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ orderStatus: "for delivery" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "for delivery" }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const assignDeliveryService = async (
  body: AssignDeliveryServiceType,
  userId: string
) => {
  const parsed = AssignDeliveryServiceSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }
  const parsedata = parsed.data;

  const { orderId, riderId } = parsedata;

  const order = await Orders.findById(orderId);
  const rider = await AdminUser.findById(riderId);

  if (!order || !rider) {
    throw new NotFoundError("Order or Rider not Found!");
  }

  const updatedOrder = await Orders.findByIdAndUpdate(
    orderId,
    { deliveryRider: riderId, orderStatus: "ongoing delivery" },
    { new: true }
  );

  const newDeliveryLog = await DeliveryLog.create({
    rider: rider.id,
    order: order.id,
    status: "assigned",
  });

  if (!updatedOrder || !newDeliveryLog) {
    throw new NotFoundError("Failed to assign delivery rider!");
  }

  await StaffActivity.create({
    staff: userId,
    order: order.id,
    action: `assigned to rider:${rider.firstname} ${rider.lastname}`,
  });

  // socket io event
  getIO().emit("orderDeliveryAssigned", {
    updatedOrder,
  });

  return {
    order: updatedOrder,
    deliveryLog: newDeliveryLog,
  };
};

const getOngoingDeliveryOrdersServices = async (
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ orderStatus: "ongoing delivery" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "ongoing delivery" }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const readyForPickupService = async (id: OrderIdType, userId: string) => {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }

  const parsedId = parsed.data;

  const orderForPickup = await Orders.findByIdAndUpdate(parsedId, {
    orderStatus: "for pickup",
  });

  if (!orderForPickup) {
    throw new NotFoundError("Order not Found!");
  }

  await StaffActivity.create({
    staff: userId,
    order: orderForPickup.id,
    action: "for pickup",
  });

  return orderForPickup;
};

const getForPickupOrdersService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ orderStatus: "for pickup" }).skip(skip).limit(limit),
    Orders.countDocuments({ orderStatus: "for pickup" }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const orderPickedupService = async (
  body: OrderPickedupServiceType,
  userId: string
) => {
  const parsed = OrderPickedupServiceSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }
  const {
    orderId,
    trackingNumber,
    modeOfPickup,
    pickupPersonName,
    validId,
    idNumber,
    contactNumber,
    pickupDateAndTime,
  } = parsed.data;

  const acceptedOrder = await Orders.findByIdAndUpdate(orderId, {
    orderStatus: "picked up",
    pickupDetails: {
      trackingNumber,
      modeOfPickup,
      pickupPersonName,
      validId,
      idNumber,
      contactNumber,
      pickupDateAndTime,
    },
  });

  if (!acceptedOrder) {
    throw new NotFoundError("Order not Found!");
  }

  await StaffActivity.create({
    staff: userId,
    order: acceptedOrder.id,
    action: "picked up",
  });

  return acceptedOrder;
};

const getTotalNumberOrdersService = async () => {
  const result = await Orders.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Transform aggregation result into a lookup
  const counts: Record<string, number> = {};
  result.forEach(({ _id, count }) => {
    counts[_id] = count;
  });

  const completedOrders =
    (counts["picked up"] || 0) + (counts["delivered"] || 0);

  return {
    pendingOrders: counts["pending"] || 0,
    acceptedOrders: counts["accepted"] || 0, // ⚠️ you missed returning this in your original function
    forPickUpOrders: counts["for pickup"] || 0,
    forDeliveryOrders: counts["for delivery"] || 0,
    ongoingDeliveryOrders: counts["ongoing delivery"] || 0,
    completedOrders,
  };
};

const getRiderPendingDeliveriesService = async (
  id: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ deliveryRider: id, orderStatus: "ongoing delivery" })
      .skip(skip)
      .limit(limit),
    Orders.countDocuments({
      deliveryRider: id,
      orderStatus: "ongoing delivery",
    }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const orderDeliveredService = async (id: OrderIdType, userId: string) => {
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Order id");
  }
  const parsedId = parsed.data;

  const deliveredOrder = await Orders.findByIdAndUpdate(parsedId, {
    orderStatus: "delivered",
  });

  if (!deliveredOrder) {
    throw new NotFoundError("Order not Found!");
  }

  await DeliveryLog.create({
    rider: userId,
    order: deliveredOrder.id,
    status: "delivered",
  });

  return deliveredOrder;
};

const getRiderDeliveredOrdersService = async (
  id: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Orders.find({ deliveryRider: id, orderStatus: "delivered" })
      .skip(skip)
      .limit(limit),
    Orders.countDocuments({
      deliveryRider: id,
      orderStatus: "delivered",
    }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getRecentOrdersService = async () => {
  const recentOrders = await Orders.find().sort({ _id: -1 }).limit(3);
  return recentOrders;
};

export default {
  getOrdersService,
  getPendingOrdersService,
  getCompletedOrdersService,
  getOrderService,
  acceptOrderService,
  getAcceptedOrderServices,
  outForDeliveryService,
  getForDeliveryOrdersServices,
  assignDeliveryService,
  getOngoingDeliveryOrdersServices,
  readyForPickupService,
  getForPickupOrdersService,
  orderPickedupService,
  getTotalNumberOrdersService,
  getRiderPendingDeliveriesService,
  orderDeliveredService,
  getRiderDeliveredOrdersService,
  getRecentOrdersService,
};
