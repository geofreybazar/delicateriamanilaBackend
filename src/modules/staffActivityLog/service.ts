import StaffActivity from "./model";

const getStaffActivityLogsService = async (id: string) => {
  const staffLogs = await StaffActivity.find({ staff: id })
    .populate("order", { referenceNumber: 1 })
    .sort({
      createdAt: -1,
    });

  return staffLogs;
};

export default {
  getStaffActivityLogsService,
};
