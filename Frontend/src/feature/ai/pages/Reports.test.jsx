import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Reports from "./Reports";
import { getAllInterviewReportsByUser, setInterviewSavedStatus } from "../services/interview.api";

vi.mock("../services/interview.api", () => ({
  getAllInterviewReportsByUser: vi.fn(),
  setInterviewSavedStatus: vi.fn(),
}));

afterEach(cleanup);

const reports = [
  {
    _id: "report-one",
    title: "Frontend Engineer",
    createdAt: "2026-01-01T00:00:00.000Z",
    matchScore: 65,
    technicalQuestions: [{}, {}],
    behaviourQuestions: [{}],
    preparationPlan: [{ day: 1, task: ["Review hooks"] }],
    completedTaskKeys: ["1:0"],
    skillGaps: [{ skill: "Testing" }],
    isSaved: false,
  },
  {
    _id: "report-two",
    title: "Frontend Engineer",
    createdAt: "2026-02-01T00:00:00.000Z",
    matchScore: 78,
    technicalQuestions: [{}],
    behaviourQuestions: [{}],
    preparationPlan: [{ day: 1, task: ["Review hooks"] }],
    completedTaskKeys: [],
    skillGaps: [],
    isSaved: false,
  },
];

describe("Reports page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllInterviewReportsByUser.mockResolvedValue({ data: reports });
    setInterviewSavedStatus.mockResolvedValue({ success: true, data: { isSaved: true } });
  });

  it("saves a report as a job and updates the saved-job filter", async () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);

    const saveButtons = await screen.findAllByRole("button", { name: "☆ Save job" });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => expect(setInterviewSavedStatus).toHaveBeenCalledWith("report-one", true));
    await waitFor(() => expect(screen.getByRole("button", { name: "Saved jobs (1)" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Saved jobs (1)" }));
    expect(screen.getByText("Frontend Engineer")).toBeTruthy();
  });

  it("compares selected reports and shows historical score and task progress", async () => {
    render(<MemoryRouter><Reports /></MemoryRouter>);

    await waitFor(() => expect(screen.getAllByRole("checkbox", { name: "Compare" })).toHaveLength(2));
    const compareBoxes = screen.getAllByRole("checkbox", { name: "Compare" });
    fireEvent.click(compareBoxes[0]);
    fireEvent.click(compareBoxes[1]);

    expect(screen.getByRole("heading", { name: "Compare reports" })).toBeTruthy();
    expect(screen.getAllByText("65%")).toHaveLength(2);
    expect(screen.getByText("1/1 tasks")).toBeTruthy();
  });

  it("ignores null entries returned with the reports payload", async () => {
    getAllInterviewReportsByUser.mockResolvedValue({ data: [undefined, null, reports[0]] });

    render(<MemoryRouter><Reports /></MemoryRouter>);

    expect(await screen.findByRole("checkbox", { name: "Compare" })).toBeTruthy();
    expect(screen.getAllByRole("checkbox", { name: "Compare" })).toHaveLength(1);
  });
});
