import { mkdtemp, readFile, writeFile, chmod } from "node:fs/promises";
import { brotliDecompressSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
// Some managed runtimes disallow tar archive ownership changes; extract without chown.
export async function browserPath() {
  if (process.env.FARM_TEST_CHROME) return process.env.FARM_TEST_CHROME;
  const dir = await mkdtemp(path.join(tmpdir(), "farmer-chrome-"));
  for (const name of ["chromium", "fonts.tar", "swiftshader.tar"]) {
    await writeFile(
      path.join(dir, name),
      brotliDecompressSync(
        await readFile(
          path.join(
            process.cwd(),
            "node_modules/@sparticuz/chromium/bin",
            name + ".br",
          ),
        ),
      ),
    );
    if (name.endsWith(".tar"))
      execFileSync("tar", [
        "--no-same-owner",
        "-xf",
        path.join(dir, name),
        "-C",
        dir,
      ]);
  }
  await chmod(path.join(dir, "chromium"), 0o755);
  process.env.LD_LIBRARY_PATH =
    dir +
    (process.env.LD_LIBRARY_PATH ? ":" + process.env.LD_LIBRARY_PATH : "");
  return path.join(dir, "chromium");
}
