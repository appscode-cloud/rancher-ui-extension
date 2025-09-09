import { Test, TestingModule } from "@nestjs/testing";
import { UsageTrackingProcessor } from "../usage-tracking.processor";
import { ActivityService } from "@app/activity-tracking/activity.services";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

describe("UsageTrackingProcessor", () => {
  let processor: UsageTrackingProcessor;
  let activityService: ActivityService;
  const mockActivityService = { logTokenUsage: jest.fn() };
  beforeEach(async () => {
    //  Mock logger to prevent error logs during tests jest.
    spyOn(Logger.prototype, "error").mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageTrackingProcessor,
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();
    processor = module.get<UsageTrackingProcessor>(UsageTrackingProcessor);
    activityService = module.get<ActivityService>(ActivityService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("process", () => {
    it("should process job and call logTokenUsage with correct data", async () => {
      const mockJobData = {
        project_id: "test-project-id",
        event_id: "test-event-id",
        user_id: "test-user-id",
        event_type: "test-event",
        file_id: "test-file-id",
        cost: 0.123,
        metadata: { additional: "data" },
      };
      const mockJob = { id: "test-job-id", data: mockJobData } as Job;
      await processor.process(mockJob);
      expect(activityService.logTokenUsage).toHaveBeenCalledWith(mockJobData);
    });
    it("should throw error if logTokenUsage fails", async () => {
      const mockError = new Error("Activity service error");
      mockActivityService.logTokenUsage.mockRejectedValueOnce(mockError);
      const mockJobData = {
        project_id: "test-project-id",
        event_id: "test-event-id",
        user_id: "test-user-id",
        event_type: "test-event",
        file_id: "test-file-id",
        cost: 0.123,
      };
      const mockJob = { id: "test-job-id", data: mockJobData } as Job;
      await expect(processor.process(mockJob)).rejects.toThrow(mockError);
    });
  });
});
