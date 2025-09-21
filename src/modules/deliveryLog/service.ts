import DeliveryLog from "./model";

const getDeliveryLogsService = async (id: string) => {
  const staffLogs = await DeliveryLog.find({ rider: id })
    .populate("order", { referenceNumber: 1 })
    .sort({
      createdAt: -1,
    });

  return staffLogs;
};

export default {
  getDeliveryLogsService,
};
