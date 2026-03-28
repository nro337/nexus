import { render, fireEvent, act, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { SettingsPage } from "../src/pages/SettingsPage";

// Mock dexie-react-hooks so useLiveQuery returns an empty tag list
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (_fn: () => unknown) => [],
}));

// Mock the db module
vi.mock("../src/db/schema", () => ({
  db: {
    tags: { orderBy: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }) },
  },
}));

// Mock the tags db module
vi.mock("../src/db/tags", () => ({
  deleteTag: vi.fn().mockResolvedValue(undefined),
}));

// Mock TagEditModal so it doesn't blow up
vi.mock("../src/components/settings/TagEditModal", () => ({
  TagEditModal: () => null,
}));

vi.mock("../src/components/settings/CustomThemeModal", () => ({
  CustomThemeModal: () => null,
}));

vi.mock("../src/store/useLanguageStore", () => ({
  useLanguageStore: () => ({
    language: "en",
    setLanguage: vi.fn(),
  }),
}));

vi.mock("../src/store/useThemeStore", () => ({
  PREDEFINED_THEMES: [],
  useThemeStore: () => ({
    theme: "dark",
    setTheme: vi.fn(),
  }),
}));

// Mock export functions
const mockExportDatabase = vi.fn().mockResolvedValue({ version: 1, exportedAt: new Date().toISOString(), resources: [], tags: [], resourceTags: [], notes: [], connections: [] });
const mockDownloadExport = vi.fn();
const mockImportDatabase = vi.fn().mockResolvedValue({ imported: 3, skipped: 1 });

vi.mock("../src/db/export", () => ({
  exportDatabase: () => mockExportDatabase(),
  downloadExport: (data: unknown) => mockDownloadExport(data),
  importDatabase: (data: unknown, mode: string) => mockImportDatabase(data, mode),
}));

describe("SettingsPage – Data section", () => {
  it("renders Export and Import buttons", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
  });

  it("calls exportDatabase and downloadExport when Export button is clicked", async () => {
    render(<SettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^export$/i }));
    });
    expect(mockExportDatabase).toHaveBeenCalledTimes(1);
    expect(mockDownloadExport).toHaveBeenCalledTimes(1);
  });

  it("shows merge and replace radio options", () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/merge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/replace/i)).toBeInTheDocument();
  });

  it("defaults to merge mode", () => {
    render(<SettingsPage />);
    const mergeRadio = screen.getByLabelText(/merge/i) as HTMLInputElement;
    const replaceRadio = screen.getByLabelText(/replace/i) as HTMLInputElement;
    expect(mergeRadio.checked).toBe(true);
    expect(replaceRadio.checked).toBe(false);
  });

  it("switches import mode to replace when replace radio is selected", () => {
    render(<SettingsPage />);
    const replaceRadio = screen.getByLabelText(/replace/i) as HTMLInputElement;
    fireEvent.click(replaceRadio);
    expect(replaceRadio.checked).toBe(true);
  });

  it("shows success message after a valid import file is processed", async () => {
    render(<SettingsPage />);

    const validBackup = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      resources: [],
      tags: [],
      resourceTags: [],
      notes: [],
      connections: [],
    });

    const file = new File([validBackup], "nexus-backup.json", { type: "application/json" });
    const fileInput = screen.getByLabelText(/import backup file/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockImportDatabase).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/imported 3 record\(s\), skipped 1 duplicate\(s\)\./i)).toBeInTheDocument();
    });
  });

  it("shows error message when an invalid JSON file is provided", async () => {
    render(<SettingsPage />);

    const file = new File(["not valid json {{{"], "bad.json", { type: "application/json" });
    const fileInput = screen.getByLabelText(/import backup file/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/failed to import file|settings\.data\.import\.importError/i)
      ).toBeInTheDocument();
    });
  });

  it("calls importDatabase with the selected mode", async () => {
    mockImportDatabase.mockClear();
    render(<SettingsPage />);

    // Switch to replace mode
    fireEvent.click(screen.getByLabelText(/replace/i));

    const validBackup = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      resources: [],
      tags: [],
      resourceTags: [],
      notes: [],
      connections: [],
    });

    const file = new File([validBackup], "nexus-backup.json", { type: "application/json" });
    const fileInput = screen.getByLabelText(/import backup file/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockImportDatabase).toHaveBeenCalledWith(expect.any(Object), "replace");
    });
  });

  it("shows success message without skipped text when no duplicates are skipped", async () => {
    mockImportDatabase.mockResolvedValueOnce({ imported: 2, skipped: 0 });
    render(<SettingsPage />);

    const validBackup = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      resources: [],
      tags: [],
      resourceTags: [],
      notes: [],
      connections: [],
    });

    const file = new File([validBackup], "nexus-backup.json", { type: "application/json" });
    const fileInput = screen.getByLabelText(/import backup file/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByText(/imported 2 record\(s\)\./i)).toBeInTheDocument();
      expect(screen.queryByText(/skipped/i)).not.toBeInTheDocument();
    });
  });
});
