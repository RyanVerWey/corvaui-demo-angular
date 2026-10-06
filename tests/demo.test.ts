import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../angular.json", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

describe("Angular showcase integrity", () => {
  it("uses only published CorvaUI packages and paths", () => {
    expect(pkg.dependencies["@corvaui/angular"]).toBe("^0.2.1");
    expect(pkg.dependencies["@corvaui/tokens"]).toBe("^0.2.1");
    expect(pkg.dependencies["@corvaui/web-components"]).toBeUndefined();
    expect(source).toContain('from "@corvaui/angular"');
    expect(source).toContain("CorvaDataGrid");
    expect(source).toContain('icon: "chartBar"');
    expect(source).toContain('icon: "clipboardList"');
    expect(source).not.toMatch(/bar-chart-3|clipboard-list/);
    expect(source).not.toMatch(/CUSTOM_ELEMENTS_SCHEMA|defineCustomElements/);
    expect(`${source}${workspace}`).not.toMatch(/apexui|@apexui/i);
    expect(source).toContain("priorWeek: 68");
  });

  it("keeps seven critical-operations routes and local media", () => {
    expect((source.match(/path: "/g) ?? []).length).toBe(7);
    expect(source).toContain("images/signal-server-room.jpg");
    expect(source).toContain("images/signal-engineer.jpg");
    expect(source).toContain("Critical operations command center");
  });
});
