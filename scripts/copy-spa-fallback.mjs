import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const browserDir = join(process.cwd(), "dist", "corvaui-demo-angular", "browser");
const indexPath = join(browserDir, "index.html");
const fallbackPath = join(browserDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error(`Missing built index at ${indexPath}`);
}

const redirectScript = `<script>
(() => {
  const base = "/corvaui-demo-angular";
  if (location.pathname.startsWith(base + "/") && location.pathname !== base + "/") {
    const route = location.pathname.slice(base.length);
    history.replaceState({}, "", base + "/" + location.search + "#" + route);
  }
})();
</script>`;

const indexHtml = readFileSync(indexPath, "utf8");
writeFileSync(fallbackPath, `${redirectScript}\n${indexHtml}`);
console.log(`Wrote SPA fallback to ${fallbackPath}`);
